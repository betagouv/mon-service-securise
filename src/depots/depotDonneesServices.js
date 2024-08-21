const {
  ErreurDonneesObligatoiresManquantes,
  ErreurServiceInexistant,
  ErreurNomServiceDejaExistant,
  ErreurDonneesNiveauSecuriteInsuffisant,
} = require('../erreurs');
const DescriptionService = require('../modeles/descriptionService');
const Dossier = require('../modeles/dossier');
const Service = require('../modeles/service');
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
      donneesService: async (donneesChiffrees) => dechiffre(donneesChiffrees),
    },
  };
};

const fabriquePersistance = (
  adaptateurPersistance,
  adaptateurChiffrement,
  referentiel,
  depotDonneesUtilisateurs
) => {
  const { chiffre, dechiffre } = fabriqueChiffrement(adaptateurChiffrement);

  const dechiffreService = async (donneesService) => {
    const { donnees, ...autreProprietes } = donneesService;
    const donneesEnClair = await dechiffre.donneesService(donnees);
    return new Service(
      {
        ...autreProprietes,
        ...donneesEnClair,
      },
      referentiel
    );
  };

  const dechiffreDonneesService = async (donneesService) => {
    const { donnees, ...autreProprietes } = donneesService;
    return { ...(await dechiffre.donneesService(donnees)), ...autreProprietes };
  };

  const enrichisService = async (service) => {
    const donneesContributeurs =
      await adaptateurPersistance.contributeursService(service.id);
    const serviceEnClair = await dechiffreDonneesService(service);
    serviceEnClair.contributeurs = await Promise.all(
      donneesContributeurs.map((d) =>
        depotDonneesUtilisateurs.dechiffreUtilisateur(d)
      )
    );
    serviceEnClair.suggestionsActions =
      await adaptateurPersistance.suggestionsActionsService(service.id);
    return new Service(serviceEnClair, referentiel);
  };

  const persistance = {
    lis: {
      un: async (idService) => {
        const s = await adaptateurPersistance.service(idService);

        if (!s) return undefined;
        return enrichisService(s);
      },
      ceuxDeUtilisateur: async (idUtilisateur) => {
        const donneesServices =
          await adaptateurPersistance.services(idUtilisateur);

        const servicesEnrichis = await Promise.all(
          donneesServices.map(async (ds) => enrichisService(ds))
        );

        return servicesEnrichis.sort((s1, s2) =>
          s1.nomService().localeCompare(s2.nomService())
        );
      },
      tous: async () => {
        const donneesServices = await adaptateurPersistance.tousLesServices();
        // TODO : Les services devraient être 'enrichis' ici
        return Promise.all(donneesServices.map((d) => dechiffreService(d)));
      },
      // TODO : refactorer -> renommer et retourner un bool
      celuiAvecNom: async (
        idUtilisateur,
        nomService,
        idServiceMisAJour = ''
      ) => {
        const hashNom = adaptateurChiffrement.hacheSha256(nomService);
        return adaptateurPersistance.serviceAvecHashNom(
          idUtilisateur,
          hashNom,
          idServiceMisAJour
        );
      },
    },
    sauvegarde: async (id, donneesService) => {
      const donneesChiffrees = await chiffre.donneesService(donneesService);

      const nomServiceHash = adaptateurChiffrement.hacheSha256(
        donneesService.descriptionService.nomService
      );

      return adaptateurPersistance.sauvegardeService(
        id,
        donneesChiffrees,
        nomServiceHash
      );
    },
    supprime: async (idService) => {
      await adaptateurPersistance.supprimeAutorisationsHomologation(idService);
      await adaptateurPersistance.supprimeService(idService);
    },
    autorisations: {
      ajoute: async (id, donnees) =>
        adaptateurPersistance.ajouteAutorisation(id, donnees),
    },
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
    depotDonneesUtilisateurs,
    referentiel,
  } = config;

  const p = fabriquePersistance(
    adaptateurPersistance,
    adaptateurChiffrement,
    referentiel,
    depotDonneesUtilisateurs
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

  const metsAJourProprieteService = (nomPropriete, idService, propriete) => {
    const metsAJour = (h) => {
      h[nomPropriete] ||= {};

      const donneesPropriete = propriete.toJSON();
      Object.assign(h[nomPropriete], donneesPropriete);

      const { id, ...donnees } = h;
      return p.sauvegarde(id, donnees);
    };

    const trouveDonneesService = (id) =>
      p.lis.un(id).then((h) => h.donneesAPersister().toutes());

    return trouveDonneesService(idService).then(metsAJour);
  };

  const metsAJourDescriptionService = (serviceCible, informations) => {
    serviceCible.descriptionService ||= {};

    Object.assign(serviceCible.descriptionService, informations.toJSON());

    const { id, ...donnees } = serviceCible;
    return p.sauvegarde(id, donnees);
  };

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

  const ajouteRisqueGeneralAService = (...params) =>
    ajouteAItemsDuService('risquesGeneraux', ...params);

  const serviceExiste = async (
    idUtilisateur,
    nomService,
    idServiceMisAJour
  ) => {
    const s = await p.lis.celuiAvecNom(
      idUtilisateur,
      nomService,
      idServiceMisAJour
    );
    return !!s;
  };

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

    if (!DescriptionService.niveauSecuriteChoisiSuffisant(donnees)) {
      throw new ErreurDonneesNiveauSecuriteInsuffisant();
    }

    const existeDeja = await serviceExiste(
      idUtilisateur,
      nomService,
      idServiceMisAJour
    );

    if (existeDeja)
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

    const s = await p.lis.un(idService);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementDescriptionServiceModifiee({ service: s, utilisateur: u })
    );
  };

  const tousLesServices = () => p.lis.tous();

  const enregistreDossier = (idHomologation, dossier) =>
    ajouteAItemsDuService('dossiers', idHomologation, dossier);

  const finaliseDossierCourant = async (s) => {
    const dossierAvantFinalisation = s.dossierCourant();

    s.finaliseDossierCourant();

    const { id, ...donneesAPersister } = s.donneesAPersister().toutes();
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
    await p.autorisations.ajoute(
      idAutorisation,
      proprietaire.donneesAPersister()
    );

    const s = await p.lis.un(idService);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementNouveauServiceCree({ service: s, utilisateur: u })
    );

    return idService;
  };

  const remplaceRisquesSpecifiquesDuService = (...params) =>
    remplaceProprieteService('risquesSpecifiques', ...params);

  const supprimeHomologation = async (idService) => {
    const { contributeurs: avantSuppression } = await p.lis.un(idService);

    await p.supprime(idService);

    await busEvenements.publie(
      new EvenementServiceSupprime({
        idService,
        autorisations: avantSuppression.map((u) => ({ idUtilisateur: u.id })),
      })
    );
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

    const indexMax = (sesServices) => {
      const resultat = sesServices
        .map((s) => s.nomService())
        .reduce(maxMatch, -Infinity);
      return Math.max(0, resultat) + 1;
    };

    const sesServices = await p.lis.ceuxDeUtilisateur(idProprietaire);
    return indexMax(sesServices);
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

  const metsAJourService = async (unService) => {
    const s = await p.lis.un(unService.id);
    if (typeof s === 'undefined')
      throw new ErreurServiceInexistant(`Service "${unService.id}" non trouvé`);

    const { id, ...donnees } = unService.donneesAPersister().toutes();
    await p.sauvegarde(unService.id, donnees);
  };

  const metsAJourMesureGeneraleDuService = async (
    idService,
    idUtilisateur,
    mesure
  ) => {
    const s = await p.lis.un(idService);
    s.metsAJourMesureGenerale(mesure);
    await metsAJourService(s);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementMesuresServiceModifiees({ service: s, utilisateur: u })
    );
  };

  const metsAJourMesuresSpecifiquesDuService = async (
    idService,
    idUtilisateur,
    mesures
  ) => {
    const s = await p.lis.un(idService);
    s.metsAJourMesuresSpecifiques(mesures);
    await metsAJourService(s);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementMesuresServiceModifiees({ service: s, utilisateur: u })
    );
  };

  const supprimeContributeur = async (idService, idUtilisateur) => {
    const unService = await p.lis.un(idService);

    unService.supprimeResponsableMesures(idUtilisateur);

    const { id, ...donnees } = unService.donneesAPersister().toutes();
    return p.sauvegarde(id, donnees);
  };

  const rechercheContributeurs = async (idProprietaire, recherche) => {
    const tousContributeurs =
      await adaptateurPersistance.contributeursDesServicesDe(
        idProprietaire,
        recherche
      );

    const tousUtilisateurs = await Promise.all(
      tousContributeurs.map((donneesContributeur) =>
        depotDonneesUtilisateurs.dechiffreUtilisateur(donneesContributeur)
      )
    );

    const normalise = (texte) =>
      texte
        ?.toLowerCase()
        // Permet de supprimer les accents : https://stackoverflow.com/a/51874002
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');

    const rechercheNormalisee = normalise(recherche);

    return tousUtilisateurs.filter(
      (contributeur) =>
        normalise(contributeur.email).includes(rechercheNormalisee) ||
        normalise(contributeur.prenomNom())?.includes(rechercheNormalisee)
    );
  };

  return {
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossierCourant,
    serviceExiste,
    enregistreDossier,
    metsAJourMesureGeneraleDuService,
    metsAJourMesuresSpecifiquesDuService,
    metsAJourService,
    nouveauService,
    service,
    services,
    rechercheContributeurs,
    remplaceRisquesSpecifiquesDuService,
    supprimeContributeur,
    supprimeHomologation,
    tousLesServices,
    trouveIndexDisponible,
  };
};

module.exports = { creeDepot };
