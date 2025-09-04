import {
  ErreurDonneesObligatoiresManquantes,
  ErreurServiceInexistant,
  ErreurNomServiceDejaExistant,
  ErreurDonneesNiveauSecuriteInsuffisant,
  ErreurStatutMesureManquant,
} from '../erreurs.js';

import DescriptionService from '../modeles/descriptionService.js';
import Dossier from '../modeles/dossier.js';
import Service from '../modeles/service.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
import EvenementNouveauServiceCree from '../bus/evenementNouveauServiceCree.js';
import { EvenementDescriptionServiceModifiee } from '../bus/evenementDescriptionServiceModifiee.js';
import EvenementDossierHomologationFinalise from '../bus/evenementDossierHomologationFinalise.js';
import EvenementServiceSupprime from '../bus/evenementServiceSupprime.js';
import Entite from '../modeles/entite.js';
import EvenementMesureServiceModifiee from '../bus/evenementMesureServiceModifiee.js';
import EvenementMesureServiceSupprimee from '../bus/evenementMesureServiceSupprimee.js';
import EvenementRisqueServiceModifie from '../bus/evenementRisqueServiceModifie.js';
import MesureGenerale from '../modeles/mesureGenerale.js';
import EvenementMesureModifieeEnMasse from '../bus/evenementMesureModifieeEnMasse.js';
import MesureSpecifique from '../modeles/mesureSpecifique.js';

const fabriqueChiffrement = (adaptateurChiffrement) => {
  const chiffre = async (chaine) => adaptateurChiffrement.chiffre(chaine);
  const dechiffre = async (chaine) => adaptateurChiffrement.dechiffre(chaine);

  return {
    chiffre: {
      donneesService: async (donneesEnClair) => chiffre(donneesEnClair),
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

  const dechiffreDonneesService = async (donneesService) => {
    const { donnees, ...autreProprietes } = donneesService;
    const donneesEnClair = await dechiffre.donneesService(donnees);
    return { ...autreProprietes, ...donneesEnClair };
  };

  const mappeDonneesVersDomaine = async (donneesService) => {
    const serviceEnClair = await dechiffreDonneesService(donneesService);

    serviceEnClair.contributeurs = await Promise.all(
      serviceEnClair.utilisateurs.map((d) =>
        depotDonneesUtilisateurs.dechiffreUtilisateur(d)
      )
    );
    delete serviceEnClair.utilisateurs;

    serviceEnClair.suggestionsActions = serviceEnClair.suggestions.map(
      (nature) => ({ nature })
    );
    delete serviceEnClair.suggestions;

    serviceEnClair.modelesDisponiblesDeMesureSpecifique = Object.fromEntries(
      await Promise.all(
        serviceEnClair.modelesDisponiblesDeMesureSpecifique.map(
          async ({ id, donnees, idUtilisateur }) => {
            const donneesEnClair =
              await adaptateurChiffrement.dechiffre(donnees);
            return [id, { ...donneesEnClair, idUtilisateur }];
          }
        )
      )
    );

    return new Service(serviceEnClair, referentiel);
  };

  const persistance = {
    lis: {
      un: async (idService) => {
        const [s] = await adaptateurPersistance.servicesComplets({ idService });

        if (!s) return undefined;
        return mappeDonneesVersDomaine(s);
      },
      ceuxAvecSiret: async (siret) => {
        const hashSiret = adaptateurChiffrement.hacheSha256(siret);

        const donnees = await adaptateurPersistance.servicesComplets({
          hashSiret,
        });

        return Promise.all(donnees.map((d) => mappeDonneesVersDomaine(d)));
      },
      ceuxDeUtilisateur: async (idUtilisateur) => {
        const donnees = await adaptateurPersistance.servicesComplets({
          idUtilisateur,
        });

        const services = await Promise.all(
          donnees.map((d) => mappeDonneesVersDomaine(d))
        );

        return services.sort((s1, s2) =>
          s1.nomService().localeCompare(s2.nomService())
        );
      },
      nombreDeUtilisateur: async (idUtilisateur) =>
        adaptateurPersistance.nombreServices(idUtilisateur),
      tous: async () => {
        const donnees = await adaptateurPersistance.servicesComplets({
          tous: true,
        });

        return Promise.all(donnees.map((d) => mappeDonneesVersDomaine(d)));
      },
      existeAvecNom: async (
        idUtilisateur,
        nomService,
        idServiceMisAJour = ''
      ) => {
        const hashNom = adaptateurChiffrement.hacheSha256(nomService);
        return adaptateurPersistance.serviceExisteAvecHashNom(
          idUtilisateur,
          hashNom,
          idServiceMisAJour
        );
      },
    },
    sauvegarde: async (id, donneesService) => {
      const { versionService, ...donneesMetier } = donneesService;
      const donneesChiffrees = await chiffre.donneesService(donneesMetier);

      const nomServiceHash = adaptateurChiffrement.hacheSha256(
        donneesService.descriptionService.nomService
      );

      const siret =
        donneesService.descriptionService?.organisationResponsable?.siret;
      const siretHash = siret ? adaptateurChiffrement.hacheSha256(siret) : null;

      return adaptateurPersistance.sauvegardeService(
        id,
        donneesChiffrees,
        nomServiceHash,
        siretHash,
        versionService
      );
    },
    supprime: async (idService) => {
      await adaptateurPersistance.supprimeAutorisationsHomologation(idService);
      await adaptateurPersistance.supprimeTousLiensEntreUnServiceEtModelesMesureSpecifique(
        idService
      );
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
    const metsAJour = (s) => {
      s[nomPropriete] ||= {};

      const donneesPropriete = propriete.toJSON();
      Object.assign(s[nomPropriete], donneesPropriete);

      const { id, ...donnees } = s;
      return p.sauvegarde(id, donnees);
    };

    const trouveDonneesService = (id) =>
      p.lis.un(id).then((s) => s.donneesAPersister().toutes());

    return trouveDonneesService(idService).then(metsAJour);
  };

  const metsAJourDescriptionService = (serviceCible, informations) => {
    serviceCible.descriptionService ||= {};

    Object.assign(serviceCible.descriptionService, informations.toJSON());

    const { id, ...donnees } = serviceCible;
    return p.sauvegarde(id, donnees);
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

  const ajouteRisqueGeneralAService = async (unService, risque) => {
    await ajouteAItemsDuService('risquesGeneraux', unService.id, risque);
    const s = await p.lis.un(unService.id);
    busEvenements.publie(new EvenementRisqueServiceModifie({ service: s }));
  };

  const serviceExiste = async (idUtilisateur, nomService, idServiceMisAJour) =>
    p.lis.existeAvecNom(idUtilisateur, nomService, idServiceMisAJour);

  const valideDescriptionService = async ({
    idUtilisateur,
    donneesDescriptionService,
    idServiceMisAJour,
    versionService,
  }) => {
    const { nomService } = donneesDescriptionService;

    Service.valideDonneesCreation(donneesDescriptionService, versionService);

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

  const nombreServices = (idUtilisateur) =>
    p.lis.nombreDeUtilisateur(idUtilisateur);

  const ajouteDescriptionService = async (idUtilisateur, idService, infos) => {
    const existant = await p.lis.un(idService);
    await valideDescriptionService({
      idUtilisateur,
      donneesDescriptionService: infos,
      idServiceMisAJour: existant.id,
      versionService: existant.versionService,
    });
    await completeDescriptionService(infos);
    await metsAJourDescriptionService(
      existant.donneesAPersister().toutes(),
      infos
    );

    const s = await p.lis.un(idService);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementDescriptionServiceModifiee({
        service: s,
        utilisateur: u,
        ancienneDescription: existant.descriptionService,
      })
    );
  };

  const tousLesServices = () => p.lis.tous();

  const tousLesServicesAvecSiret = (siret) => p.lis.ceuxAvecSiret(siret);

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

    if (!donneesService.versionService)
      donneesService.versionService = referentiel.versionServiceParDefaut();

    await valideDescriptionService({
      idUtilisateur,
      donneesDescriptionService: donneesService.descriptionService,
      versionService: donneesService.versionService,
    });

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

  const supprimeService = async (idService) => {
    const { contributeurs: avantSuppression } = await p.lis.un(idService);

    await p.supprime(idService);

    await busEvenements.publie(
      new EvenementServiceSupprime({
        idService,
        autorisations: avantSuppression.map((u) => ({
          idUtilisateur: u.idUtilisateur,
        })),
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

  const dupliqueService = async (
    idService,
    idProprietaire,
    nouveauNomEtSiret = null
  ) => {
    const donneesADupliquerAvecNomEtSiret = (s) =>
      s.donneesADupliquer(
        nouveauNomEtSiret.nomService,
        nouveauNomEtSiret.siret
      );

    const donneesADupliquerAvecNomCopie = async (s) => {
      const nomCopie = `${s.nomService()} - Copie`;
      const index = await trouveIndexDisponible(idProprietaire, nomCopie);
      return s.donneesADupliquer(
        `${nomCopie} ${index}`,
        s.siretDeOrganisation()
      );
    };

    const s = await p.lis.un(idService);
    if (typeof s === 'undefined')
      throw new ErreurServiceInexistant(`Service "${idService}" non trouvé`);

    s.mesuresSpecifiques().detacheMesuresNonAssocieesA(idProprietaire);

    const donnees = nouveauNomEtSiret
      ? donneesADupliquerAvecNomEtSiret(s)
      : await donneesADupliquerAvecNomCopie(s);

    const idServiceDuplique = await nouveauService(idProprietaire, donnees);
    await adaptateurPersistance.associeModelesMesureSpecifiqueAuService(
      s.mesuresSpecifiques().listeIdentifiantsModelesAssocies(),
      idServiceDuplique
    );

    return idServiceDuplique;
  };

  const metsAJourService = async (unService) => {
    const existe = await adaptateurPersistance.verifieServiceExiste(
      unService.id
    );
    if (!existe)
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
    const ancienneMesure = s.mesuresGenerales().avecId(mesure.id);
    s.metsAJourMesureGenerale(mesure);
    await metsAJourService(s);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementMesureServiceModifiee({
        service: s,
        utilisateur: u,
        ancienneMesure,
        nouvelleMesure: mesure,
        typeMesure: 'generale',
      })
    );
  };

  const metsAJourMesureGeneraleDesServices = async (
    idUtilisateur,
    idsServices,
    idMesure,
    statut,
    modalites
  ) => {
    const utilisateur =
      await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    const servicesDeUtilisateur = await p.lis.ceuxDeUtilisateur(idUtilisateur);
    const servicesConcernes = servicesDeUtilisateur.filter((s) =>
      idsServices.includes(s.id)
    );

    const pourUnService = async (s) => {
      const ancienneMesure = s.mesuresGenerales().avecId(idMesure);
      let nouvelleMesure;
      if (!ancienneMesure) {
        if (!statut) throw new ErreurStatutMesureManquant();

        nouvelleMesure = new MesureGenerale(
          {
            id: idMesure,
            statut,
            modalites,
          },
          referentiel
        );
      } else {
        nouvelleMesure = new MesureGenerale(
          { ...s.mesuresGenerales().avecId(idMesure) },
          referentiel
        );
        if (statut) nouvelleMesure.statut = statut;
        if (modalites) nouvelleMesure.modalites = modalites;
      }

      s.metsAJourMesureGenerale(nouvelleMesure);
      await metsAJourService(s);

      await busEvenements.publie(
        new EvenementMesureServiceModifiee({
          service: s,
          utilisateur,
          ancienneMesure,
          nouvelleMesure,
          typeMesure: 'generale',
        })
      );
    };

    await Promise.all(servicesConcernes.map(pourUnService));
    await busEvenements.publie(
      new EvenementMesureModifieeEnMasse({
        utilisateur,
        idMesure,
        statutModifie: !!statut,
        modalitesModifiees: !!modalites,
        nombreServicesConcernes: servicesConcernes.length,
        typeMesure: 'generale',
      })
    );
  };

  const metsAJourMesuresSpecifiquesDesServices = async (
    idUtilisateur,
    idsServices,
    idModele,
    statut,
    modalites
  ) => {
    const utilisateur =
      await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    const servicesDeUtilisateur = await p.lis.ceuxDeUtilisateur(idUtilisateur);
    const servicesConcernes = servicesDeUtilisateur.filter((s) =>
      idsServices.includes(s.id)
    );

    const pourUnService = async (s) => {
      const ancienneMesure = s.mesuresSpecifiques().avecIdModele(idModele);

      if (!ancienneMesure.statut && !statut)
        throw new ErreurStatutMesureManquant();

      const nouvelleMesure = new MesureSpecifique(ancienneMesure, referentiel);
      if (statut) nouvelleMesure.statut = statut;
      if (modalites) nouvelleMesure.modalites = modalites;

      s.metsAJourMesureSpecifique(nouvelleMesure);
      await metsAJourService(s);

      await busEvenements.publie(
        new EvenementMesureServiceModifiee({
          service: s,
          utilisateur,
          ancienneMesure,
          nouvelleMesure,
          typeMesure: 'specifique',
        })
      );
    };
    await Promise.all(servicesConcernes.map(pourUnService));

    await busEvenements.publie(
      new EvenementMesureModifieeEnMasse({
        utilisateur,
        statutModifie: !!statut,
        modalitesModifiees: !!modalites,
        nombreServicesConcernes: servicesConcernes.length,
        typeMesure: 'specifique',
      })
    );
  };

  const metsAJourMesureSpecifiqueDuService = async (
    idService,
    idUtilisateur,
    mesure
  ) => {
    const s = await p.lis.un(idService);
    const ancienneMesure = s.mesuresSpecifiques().avecId(mesure.id);
    s.metsAJourMesureSpecifique(mesure);
    await metsAJourService(s);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementMesureServiceModifiee({
        service: s,
        utilisateur: u,
        ancienneMesure,
        nouvelleMesure: mesure,
        typeMesure: 'specifique',
      })
    );
  };

  const ajouteMesureSpecifiqueAuService = async (
    mesure,
    idUtilisateur,
    idService
  ) => {
    mesure.id = adaptateurUUID.genereUUID();
    const s = await p.lis.un(idService);
    s.ajouteMesureSpecifique(mesure);
    await metsAJourService(s);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementMesureServiceModifiee({
        service: s,
        utilisateur: u,
        nouvelleMesure: mesure,
      })
    );
  };

  const supprimeMesureSpecifiqueDuService = async (
    idService,
    idUtilisateur,
    idMesure
  ) => {
    const s = await p.lis.un(idService);
    s.supprimeMesureSpecifique(idMesure);
    await metsAJourService(s);
    const u = await depotDonneesUtilisateurs.utilisateur(idUtilisateur);
    await busEvenements.publie(
      new EvenementMesureServiceSupprimee({
        service: s,
        utilisateur: u,
        idMesure,
      })
    );
  };

  const metsAJourServiceApresModificationDesRisques = async (s) => {
    await metsAJourService(s);
    busEvenements.publie(new EvenementRisqueServiceModifie({ service: s }));
  };

  const ajouteRisqueSpecifiqueAService = async (idService, risque) => {
    risque.id = adaptateurUUID.genereUUID();
    const s = await p.lis.un(idService);
    s.ajouteRisqueSpecifique(risque);
    await metsAJourServiceApresModificationDesRisques(s);
  };

  const metsAJourRisqueSpecifiqueDuService = async (idService, risque) => {
    const s = await p.lis.un(idService);
    s.metsAJourRisqueSpecifique(risque);
    await metsAJourServiceApresModificationDesRisques(s);
  };

  const supprimeRisqueSpecifiqueDuService = async (idService, idRisque) => {
    const s = await p.lis.un(idService);
    s.supprimeRisqueSpecifique(idRisque);
    await metsAJourServiceApresModificationDesRisques(s);
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
    ajouteMesureSpecifiqueAuService,
    ajouteRisqueGeneralAService,
    ajouteRisqueSpecifiqueAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossierCourant,
    serviceExiste,
    enregistreDossier,
    metsAJourMesureGeneraleDesServices,
    metsAJourMesureGeneraleDuService,
    metsAJourMesureSpecifiqueDuService,
    metsAJourMesuresSpecifiquesDesServices,
    metsAJourRisqueSpecifiqueDuService,
    metsAJourService,
    nombreServices,
    nouveauService,
    service,
    services,
    rechercheContributeurs,
    supprimeContributeur,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    supprimeService,
    tousLesServices,
    tousLesServicesAvecSiret,
    trouveIndexDisponible,
  };
};

export { creeDepot };
