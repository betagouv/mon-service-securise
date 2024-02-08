const adaptateurChiffrementParDefaut = require('../adaptateurs/adaptateurChiffrement');
const fabriqueAdaptateurTracking = require('../adaptateurs/fabriqueAdaptateurTracking');
const {
  ErreurDonneesObligatoiresManquantes,
  ErreurServiceInexistant,
  ErreurNomServiceDejaExistant,
} = require('../erreurs');
const DescriptionService = require('../modeles/descriptionService');
const Dossier = require('../modeles/dossier');
const Homologation = require('../modeles/homologation');
const EvenementCompletudeServiceModifiee = require('../modeles/journalMSS/evenementCompletudeServiceModifiee');
const EvenementNouvelleHomologationCreee = require('../modeles/journalMSS/evenementNouvelleHomologationCreee');
const EvenementServiceSupprime = require('../modeles/journalMSS/evenementServiceSupprime');
const { fabriqueServiceTracking } = require('../tracking/serviceTracking');
const Autorisation = require('../modeles/autorisations/autorisation');
const EvenementMesuresServiceModifiees = require('../bus/evenementMesuresServiceModifiees');
const EvenementNouveauServiceCree = require('../bus/evenementNouveauServiceCree');

const fabriqueChiffrement = (adaptateurChiffrement) => {
  const chiffre = (chaine) => adaptateurChiffrement.chiffre(chaine);

  return {
    chiffre: {
      donneesService: (donnees) => {
        const { descriptionService } = donnees;
        return {
          ...donnees,
          descriptionService: {
            ...descriptionService,
            nomService: chiffre(descriptionService.nomService),
            presentation: chiffre(descriptionService.presentation),
            organisationsResponsables:
              descriptionService.organisationsResponsables.map(
                adaptateurChiffrement.chiffre
              ),
            pointsAcces: descriptionService.pointsAcces.map((p) => ({
              ...p,
              description: chiffre(p.description),
            })),
          },
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
  const { chiffre } = fabriqueChiffrement(adaptateurChiffrement);

  const persistance = {
    lis: {
      une: async (idHomologation) => {
        const h = await adaptateurPersistance.homologation(idHomologation);
        return h ? new Homologation(h, referentiel) : undefined;
      },
      cellesDeUtilisateur: async (idUtilisateur) => {
        const hs = await adaptateurPersistance.homologations(idUtilisateur);
        return hs
          .map((h) => new Homologation(h, referentiel))
          .sort((h1, h2) => h1.nomService().localeCompare(h2.nomService()));
      },
      toutes: async () => persistance.lis.cellesDeUtilisateur(),
      celleAvecNomService: async (...params) =>
        adaptateurPersistance.homologationAvecNomService(...params),
    },
    sauvegarde: async (id, donneesService) => {
      const donneesChiffrees = chiffre.donneesService(donneesService);
      return Promise.all([
        adaptateurPersistance.sauvegardeService(id, donneesChiffrees),
        adaptateurPersistance.sauvegardeHomologation(id, donneesChiffrees),
      ]);
    },
    supprime: async (idHomologation) =>
      Promise.all([
        adaptateurPersistance.supprimeHomologation(idHomologation),
        adaptateurPersistance.supprimeService(idHomologation),
      ]),
  };

  return persistance;
};

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement = adaptateurChiffrementParDefaut,
    adaptateurJournalMSS,
    adaptateurPersistance,
    adaptateurTracking = fabriqueAdaptateurTracking(),
    adaptateurUUID,
    busEvenements,
    referentiel,
    serviceTracking = fabriqueServiceTracking(),
  } = config;

  const p = fabriquePersistance(
    adaptateurPersistance,
    adaptateurChiffrement,
    referentiel
  );

  const homologation = (idHomologation) => p.lis.une(idHomologation);

  const ajouteAItemsDuService = async (nomListeItems, idService, item) => {
    const s = await p.lis.une(idService);
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
    const metsAJour = (h) => {
      h[nomPropriete] ||= {};

      const donneesPropriete = propriete.toJSON();
      Object.assign(h[nomPropriete], donneesPropriete);

      const { id, ...donnees } = h;
      return p.sauvegarde(id, donnees);
    };

    const trouveDonneesService = (param) =>
      typeof param === 'object'
        ? Promise.resolve(param)
        : p.lis.une(param).then((h) => h.donneesAPersister().toutes());

    return trouveDonneesService(idOuService).then(metsAJour);
  };

  const metsAJourDescriptionService = (serviceCible, informations) =>
    metsAJourProprieteService('descriptionService', serviceCible, informations);

  const remplaceProprieteService = async (
    nomPropriete,
    idService,
    propriete
  ) => {
    const s = await p.lis.une(idService);
    const donneesAPersister = s.donneesAPersister().toutes();
    donneesAPersister[nomPropriete] = propriete.toJSON();

    const { id, ...donnees } = donneesAPersister;
    await p.sauvegarde(id, donnees);
  };

  const ajouteDossierCourantSiNecessaire = async (idService) => {
    const s = await p.lis.une(idService);

    if (typeof s === 'undefined')
      throw new ErreurServiceInexistant(`Service "${idService}" non trouvé`);

    if (s.dossierCourant()) return s.dossierCourant();

    const idDossier = adaptateurUUID.genereUUID();
    const dossier = new Dossier({ id: idDossier });
    await ajouteAItemsDuService('dossiers', idService, dossier);
    return dossier;
  };

  const ajouteMesuresGeneralesAService = async (idService, mesures) => {
    const s = await p.lis.une(idService);
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
    p.lis.celleAvecNomService(...params).then((h) => !!h);

  const valideDescriptionService = async (
    idUtilisateur,
    donnees,
    idHomologationMiseAJour
  ) => {
    const { nomService } = donnees;

    if (!DescriptionService.proprietesObligatoiresRenseignees(donnees)) {
      throw new ErreurDonneesObligatoiresManquantes(
        'Certaines données obligatoires ne sont pas renseignées'
      );
    }

    const serviceExistant = await serviceExiste(
      idUtilisateur,
      nomService,
      idHomologationMiseAJour
    );

    if (serviceExistant)
      throw new ErreurNomServiceDejaExistant(
        `Le nom du service "${nomService}" existe déjà pour un autre service`
      );
  };

  const ajouteRolesResponsabilitesAService = (...params) =>
    metsAJourProprieteService('rolesResponsabilites', ...params);

  const homologations = (idUtilisateur) =>
    p.lis.cellesDeUtilisateur(idUtilisateur);

  const ajouteDescriptionService = async (idUtilisateur, idService, infos) => {
    const consigneEvenement = async (s) =>
      adaptateurJournalMSS.consigneEvenement(
        new EvenementCompletudeServiceModifiee({
          idService,
          ...s.completudeMesures(),
          nombreOrganisationsUtilisatrices:
            s.descriptionService.nombreOrganisationsUtilisatrices,
        }).toJSON()
      );

    const envoieTrackingCompletude = async () => {
      const tauxCompletude =
        await serviceTracking.completudeDesServicesPourUtilisateur(
          { homologations },
          idUtilisateur
        );

      const utilisateur =
        await adaptateurPersistance.utilisateur(idUtilisateur);

      await adaptateurTracking.envoieTrackingCompletudeService(
        utilisateur.email,
        tauxCompletude
      );
    };

    const service = await p.lis.une(idService);
    await valideDescriptionService(idUtilisateur, infos, service.id);
    await metsAJourDescriptionService(
      service.donneesAPersister().toutes(),
      infos
    );

    const serviceFrais = await p.lis.une(idService);
    await consigneEvenement(serviceFrais);
    await envoieTrackingCompletude();
  };

  const ajouteMesuresAuService = async (
    idService,
    idUtilisateur,
    generales,
    specifiques
  ) => {
    await ajouteMesuresGeneralesAService(idService, generales);
    await remplaceMesuresSpecifiquesPourService(idService, specifiques);

    const service = await p.lis.une(idService);
    const utilisateur = await adaptateurPersistance.utilisateur(idUtilisateur);

    await busEvenements.publie(
      new EvenementMesuresServiceModifiees({ service, utilisateur })
    );
  };

  const tousLesServices = () => p.lis.toutes();

  const enregistreDossier = (idHomologation, dossier) =>
    ajouteAItemsDuService('dossiers', idHomologation, dossier);

  const finaliseDossierCourant = async (service) => {
    const dossierAvantFinalisation = service.dossierCourant();

    service.finaliseDossierCourant();

    const { id, ...donneesAPersister } = service.donneesAPersister().toutes();
    await p.sauvegarde(id, donneesAPersister);

    const evenement = new EvenementNouvelleHomologationCreee({
      idService: id,
      dateHomologation: dossierAvantFinalisation.decision.dateHomologation,
      dureeHomologationMois: referentiel.nbMoisDecalage(
        dossierAvantFinalisation.decision.dureeValidite
      ),
    });

    await adaptateurJournalMSS.consigneEvenement(evenement.toJSON());
  };

  const nouveauService = async (idUtilisateur, donneesService) => {
    const idService = adaptateurUUID.genereUUID();
    const idAutorisation = adaptateurUUID.genereUUID();

    await valideDescriptionService(
      idUtilisateur,
      donneesService.descriptionService
    );

    await p.sauvegarde(idService, donneesService);

    const proprietaire = Autorisation.NouvelleAutorisationProprietaire({
      idUtilisateur,
      idService,
    });
    await adaptateurPersistance.ajouteAutorisation(
      idAutorisation,
      proprietaire.donneesAPersister()
    );

    const service = await p.lis.une(idService);
    const utilisateur = await adaptateurPersistance.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementNouveauServiceCree({ service, utilisateur })
    );

    return idService;
  };

  const remplaceRisquesSpecifiquesDuService = (...params) =>
    remplaceProprieteService('risquesSpecifiques', ...params);

  const supprimeHomologation = (idHomologation) =>
    adaptateurPersistance
      .supprimeAutorisationsHomologation(idHomologation)
      .then(() => p.supprime(idHomologation))
      .then(() =>
        adaptateurJournalMSS.consigneEvenement(
          new EvenementServiceSupprime({ idService: idHomologation }).toJSON()
        )
      );

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

    const indexMax = (services) => {
      const resultat = services
        .map((s) => s.nomService())
        .reduce(maxMatch, -Infinity);
      return Math.max(0, resultat) + 1;
    };

    const services = await p.lis.cellesDeUtilisateur(idProprietaire);
    return indexMax(services);
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

    const s = await p.lis.une(idService);
    if (typeof s === 'undefined')
      throw new ErreurServiceInexistant(`Service "${idService}" non trouvé`);

    await duplique(s);
  };

  return {
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAuService,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossierCourant,
    homologation,
    serviceExiste,
    homologations,
    enregistreDossier,
    nouveauService,
    remplaceRisquesSpecifiquesDuService,
    supprimeHomologation,
    tousLesServices,
    trouveIndexDisponible,
  };
};

module.exports = { creeDepot };
