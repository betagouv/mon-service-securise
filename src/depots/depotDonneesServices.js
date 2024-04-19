const {
  ErreurDonneesObligatoiresManquantes,
  ErreurServiceInexistant,
  ErreurNomServiceDejaExistant,
} = require('../erreurs');
const DescriptionService = require('../modeles/descriptionService');
const Dossier = require('../modeles/dossier');
const Homologation = require('../modeles/homologation');
const Autorisation = require('../modeles/autorisations/autorisation');
const EvenementMesuresServiceModifiees = require('../bus/evenementMesuresServiceModifiees');
const EvenementNouveauServiceCree = require('../bus/evenementNouveauServiceCree');
const {
  EvenementDescriptionServiceModifiee,
} = require('../bus/evenementDescriptionServiceModifiee');
const EvenementDossierHomologationFinalise = require('../bus/evenementDossierHomologationFinalise');
const EvenementServiceSupprime = require('../bus/evenementServiceSupprime');
const Entite = require('../modeles/entite');

const fabriqueChiffrement = (adaptateurChiffrement) => {
  const chiffre = async (chaine) => adaptateurChiffrement.chiffre(chaine);
  const dechiffre = async (chaine) => adaptateurChiffrement.dechiffre(chaine);

  return {
    chiffre: {
      donneesService: async (donnees) => {
        const { descriptionService } = donnees;
        return {
          ...donnees,
          descriptionService: await chiffre(descriptionService),
        };
      },
    },
    dechiffre: {
      donneesService: async (donnees) => {
        const { descriptionService } = donnees;
        return {
          ...donnees,
          descriptionService: await dechiffre(descriptionService),
        };
      },
    },
  };
};

const fabriquePersistance = (
  adaptateurPersistance,
  adaptateurChiffrement,
  referentiel
) => {
  const { chiffre, dechiffre } = fabriqueChiffrement(adaptateurChiffrement);

  const persistance = {
    lis: {
      un: async (idService) => {
        const service = await adaptateurPersistance.service(idService);

        if (!service) return undefined;

        const donneesEnClair = await dechiffre.donneesService(service);
        return new Homologation(donneesEnClair, referentiel);
      },
      ceuxDeUtilisateur: async (idUtilisateur) => {
        const services = await adaptateurPersistance.services(idUtilisateur);
        return services
          .map((s) => new Homologation(s, referentiel))
          .sort((s1, s2) => s1.nomService().localeCompare(s2.nomService()));
      },
      tous: async () => {
        const donneesServices = await adaptateurPersistance.tousLesServices();
        return donneesServices.map((s) => new Homologation(s, referentiel));
      },
      ceuxAvecNom: async (...params) =>
        adaptateurPersistance.serviceAvecNom(...params),
    },
    sauvegarde: async (id, donneesService) => {
      const donneesChiffrees = await chiffre.donneesService(donneesService);
      return adaptateurPersistance.sauvegardeService(id, donneesChiffrees);
    },
    supprime: async (idService) =>
      adaptateurPersistance.supprimeService(idService),
  };

  return persistance;
};

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurPersistance,
    adaptateurUUID,
    adaptateurRechercheEntite,
    busEvenements,
    referentiel,
  } = config;

  const p = fabriquePersistance(
    adaptateurPersistance,
    adaptateurChiffrement,
    referentiel
  );

  const service = (idService) => p.lis.un(idService);

  const ajouteAItemsDuService = async (nomListeItems, idService, item) => {
    const s = await p.lis.un(idService);
    const donneesAPersister = s.donneesAPersister().toutes();
    donneesAPersister[nomListeItems] ||= [];

    const donneesItem = item.toJSON();
    const itemDejaDansDepot = donneesAPersister[nomListeItems].find(
      (i) => i.id === donneesItem.id
    );

    if (itemDejaDansDepot) Object.assign(itemDejaDansDepot, donneesItem);
    else donneesAPersister[nomListeItems].push(donneesItem);

    const { id, ...donnees } = donneesAPersister;
    await p.sauvegarde(id, donnees);
  };

  const metsAJourProprieteService = (nomPropriete, idOuService, propriete) => {
    const metsAJour = (s) => {
      s[nomPropriete] ||= {};

      const donneesPropriete = propriete.toJSON();
      Object.assign(s[nomPropriete], donneesPropriete);

      const { id, ...donnees } = s;
      return p.sauvegarde(id, donnees);
    };

    const trouveDonneesService = (param) =>
      typeof param === 'object'
        ? Promise.resolve(param)
        : p.lis.un(param).then((s) => s.donneesAPersister().toutes());

    return trouveDonneesService(idOuService).then(metsAJour);
  };

  const metsAJourDescriptionService = (serviceCible, informations) =>
    metsAJourProprieteService('descriptionService', serviceCible, informations);

  const remplaceProprieteService = async (
    nomPropriete,
    idService,
    propriete
  ) => {
    const s = await p.lis.un(idService);
    const donneesAPersister = s.donneesAPersister().toutes();
    donneesAPersister[nomPropriete] = propriete.toJSON();

    const { id, ...donnees } = donneesAPersister;
    await p.sauvegarde(id, donnees);
  };

  const ajouteDossierCourantSiNecessaire = async (idService) => {
    const s = await p.lis.un(idService);

    if (typeof s === 'undefined')
      throw new ErreurServiceInexistant(`Service "${idService}" non trouvé`);

    if (s.dossierCourant()) return s.dossierCourant();

    const idDossier = adaptateurUUID.genereUUID();
    const dossier = new Dossier({ id: idDossier });
    await ajouteAItemsDuService('dossiers', idService, dossier);
    return dossier;
  };

  const ajouteMesuresGeneralesAService = async (idService, mesures) => {
    const s = await p.lis.un(idService);
    const donneesAPersister = s.donneesAPersister().toutes();
    donneesAPersister.mesuresGenerales ||= [];

    mesures.forEach((mesure) => {
      const donneesMesure = mesure.toJSON();
      const mesurePresente = donneesAPersister.mesuresGenerales.find(
        (i) => i.id === donneesMesure.id
      );

      if (mesurePresente) Object.assign(mesurePresente, donneesMesure);
      else donneesAPersister.mesuresGenerales.push(donneesMesure);
    });

    const { id, ...donnees } = donneesAPersister;
    await p.sauvegarde(id, donnees);
  };

  const remplaceMesuresSpecifiquesPourService = (...params) =>
    remplaceProprieteService('mesuresSpecifiques', ...params);

  const ajouteRisqueGeneralAService = (...params) =>
    ajouteAItemsDuService('risquesGeneraux', ...params);

  const serviceExiste = (...params) =>
    p.lis.ceuxAvecNom(...params).then((s) => !!s);

  const valideDescriptionService = async (
    idUtilisateur,
    donnees,
    idServiceMisAJour
  ) => {
    const { nomService } = donnees;

    if (!DescriptionService.proprietesObligatoiresRenseignees(donnees)) {
      throw new ErreurDonneesObligatoiresManquantes(
        'Certaines données obligatoires ne sont pas renseignées'
      );
    }
    Entite.valideDonnees(donnees.organisationResponsable);

    const serviceExistant = await serviceExiste(
      idUtilisateur,
      nomService,
      idServiceMisAJour
    );

    if (serviceExistant)
      throw new ErreurNomServiceDejaExistant(
        `Le nom du service "${nomService}" existe déjà pour un autre service`
      );
  };

  const completeDescriptionService = async (donneesDescriptionService) => {
    const donneesEntite = await Entite.completeDonnees(
      donneesDescriptionService.organisationResponsable,
      adaptateurRechercheEntite
    );
    donneesDescriptionService.organisationResponsable = new Entite(
      donneesEntite
    );
  };

  const ajouteRolesResponsabilitesAService = (...params) =>
    metsAJourProprieteService('rolesResponsabilites', ...params);

  const services = (idUtilisateur) => p.lis.ceuxDeUtilisateur(idUtilisateur);

  const ajouteDescriptionService = async (idUtilisateur, idService, infos) => {
    const existant = await p.lis.un(idService);
    await valideDescriptionService(idUtilisateur, infos, existant.id);
    await completeDescriptionService(infos);
    await metsAJourDescriptionService(
      existant.donneesAPersister().toutes(),
      infos
    );

    const serviceAJour = await p.lis.un(idService);
    const utilisateur = await adaptateurPersistance.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementDescriptionServiceModifiee({
        service: serviceAJour,
        utilisateur,
      })
    );
  };

  const ajouteMesuresAuService = async (
    idService,
    idUtilisateur,
    generales,
    specifiques
  ) => {
    await ajouteMesuresGeneralesAService(idService, generales);
    await remplaceMesuresSpecifiquesPourService(idService, specifiques);

    const serviceAJour = await p.lis.un(idService);
    const utilisateur = await adaptateurPersistance.utilisateur(idUtilisateur);

    await busEvenements.publie(
      new EvenementMesuresServiceModifiees({
        service: serviceAJour,
        utilisateur,
      })
    );
  };

  const tousLesServices = () => p.lis.tous();

  const enregistreDossier = (idService, dossier) =>
    ajouteAItemsDuService('dossiers', idService, dossier);

  const finaliseDossierCourant = async (leService) => {
    const dossierAvantFinalisation = leService.dossierCourant();

    leService.finaliseDossierCourant();

    const { id, ...donneesAPersister } = leService.donneesAPersister().toutes();
    await p.sauvegarde(id, donneesAPersister);

    await busEvenements.publie(
      new EvenementDossierHomologationFinalise({
        idService: id,
        dossier: dossierAvantFinalisation,
      })
    );
  };

  const nouveauService = async (idUtilisateur, donneesService) => {
    const idService = adaptateurUUID.genereUUID();
    const idAutorisation = adaptateurUUID.genereUUID();

    await valideDescriptionService(
      idUtilisateur,
      donneesService.descriptionService
    );

    await completeDescriptionService(donneesService.descriptionService);

    await p.sauvegarde(idService, donneesService);

    const proprietaire = Autorisation.NouvelleAutorisationProprietaire({
      idUtilisateur,
      idService,
    });
    await adaptateurPersistance.ajouteAutorisation(
      idAutorisation,
      proprietaire.donneesAPersister()
    );

    const serviceAJour = await p.lis.un(idService);
    const utilisateur = await adaptateurPersistance.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementNouveauServiceCree({ service: serviceAJour, utilisateur })
    );

    return idService;
  };

  const remplaceRisquesSpecifiquesDuService = (...params) =>
    remplaceProprieteService('risquesSpecifiques', ...params);

  const supprimeService = async (idService) => {
    await adaptateurPersistance.supprimeAutorisationsService(idService);
    await p.supprime(idService);
    await busEvenements.publie(new EvenementServiceSupprime({ idService }));
  };

  const trouveIndexDisponible = async (idProprietaire, nomService) => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
    const nomCompatibleRegExp = nomService.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );
    const filtreNomDuplique = new RegExp(`^${nomCompatibleRegExp} (\\d+)$`);

    const maxMatch = (maxCourant, nomCandidat) => {
      const index = parseInt(nomCandidat.match(filtreNomDuplique)?.[1], 10);
      return index > maxCourant ? index : maxCourant;
    };

    const indexMax = (lesServices) => {
      const resultat = lesServices
        .map((s) => s.nomService())
        .reduce(maxMatch, -Infinity);
      return Math.max(0, resultat) + 1;
    };

    const servicesDeLutilisateur =
      await p.lis.ceuxDeUtilisateur(idProprietaire);
    return indexMax(servicesDeLutilisateur);
  };

  const dupliqueService = async (idService, idProprietaire) => {
    const duplique = async (s) => {
      const nomDuplication = `${s.nomService()} - Copie`;
      const donneesADupliquer = (index) =>
        s.donneesADupliquer(`${nomDuplication} ${index}`);

      const index = await trouveIndexDisponible(idProprietaire, nomDuplication);
      const donnees = donneesADupliquer(index);
      await nouveauService(idProprietaire, donnees);
    };

    const s = await p.lis.un(idService);
    if (typeof s === 'undefined')
      throw new ErreurServiceInexistant(`Service "${idService}" non trouvé`);

    await duplique(s);
  };

  const metsAJourService = async (leService) => {
    const s = await p.lis.un(leService.id);
    if (typeof s === 'undefined')
      throw new ErreurServiceInexistant(`Service "${leService.id}" non trouvé`);

    await p.sauvegarde(leService.id, leService.donneesAPersister().toutes());
  };

  return {
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAuService,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossierCourant,
    service,
    serviceExiste,
    services,
    enregistreDossier,
    metsAJourService,
    nouveauService,
    remplaceRisquesSpecifiquesDuService,
    supprimeService,
    tousLesServices,
    trouveIndexDisponible,
  };
};

module.exports = { creeDepot };
