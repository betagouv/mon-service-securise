const adaptateurChiffrementParDefaut = require('../adaptateurs/adaptateurChiffrement');
const fabriqueAdaptateurTracking = require('../adaptateurs/fabriqueAdaptateurTracking');
const {
  ErreurDonneesObligatoiresManquantes,
  ErreurHomologationInexistante,
  ErreurNomServiceDejaExistant,
} = require('../erreurs');
const DescriptionService = require('../modeles/descriptionService');
const Dossier = require('../modeles/dossier');
const Homologation = require('../modeles/homologation');
const EvenementCompletudeServiceModifiee = require('../modeles/journalMSS/evenementCompletudeServiceModifiee');
const EvenementNouveauServiceCree = require('../modeles/journalMSS/evenementNouveauServiceCree');
const EvenementNouvelleHomologationCreee = require('../modeles/journalMSS/evenementNouvelleHomologationCreee');
const EvenementServiceSupprime = require('../modeles/journalMSS/evenementServiceSupprime');
const { avecPMapPourChaqueElement } = require('../utilitaires/pMap');
const ServiceTracking = require('../tracking/serviceTracking');

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
    referentiel,
    serviceTracking = ServiceTracking.creeService(),
  } = config;

  const p = fabriquePersistance(
    adaptateurPersistance,
    adaptateurChiffrement,
    referentiel
  );

  const homologation = (idHomologation) => p.lis.une(idHomologation);

  const ajouteAItemsDansHomologation = (nomListeItems, idHomologation, item) =>
    p.lis.une(idHomologation).then((h) => {
      const donneesAPersister = h.donneesAPersister().toutes();
      donneesAPersister[nomListeItems] ||= [];

      const donneesItem = item.toJSON();
      const itemDejaDansDepot = donneesAPersister[nomListeItems].find(
        (i) => i.id === donneesItem.id
      );

      if (itemDejaDansDepot) {
        Object.assign(itemDejaDansDepot, donneesItem);
      } else {
        donneesAPersister[nomListeItems].push(donneesItem);
      }

      const { id, ...donnees } = donneesAPersister;
      return p.sauvegarde(id, donnees);
    });

  const metsAJourProprieteHomologation = (
    nomPropriete,
    idOuHomologation,
    propriete
  ) => {
    const metsAJour = (h) => {
      h[nomPropriete] ||= {};

      const donneesPropriete = propriete.toJSON();
      Object.assign(h[nomPropriete], donneesPropriete);

      const { id, ...donnees } = h;
      return p.sauvegarde(id, donnees);
    };

    const trouveDonneesHomologation = (param) =>
      typeof param === 'object'
        ? Promise.resolve(param)
        : p.lis.une(param).then((h) => h.donneesAPersister().toutes());

    return trouveDonneesHomologation(idOuHomologation).then(metsAJour);
  };

  const metsAJourDescriptionServiceHomologation = (
    homologationCible,
    informations
  ) =>
    metsAJourProprieteHomologation(
      'descriptionService',
      homologationCible,
      informations
    );

  const remplaceProprieteHomologation = (
    nomPropriete,
    idHomologation,
    propriete
  ) =>
    p.lis.une(idHomologation).then((h) => {
      const donneesAPersister = h.donneesAPersister().toutes();
      const donneesPropriete = propriete.toJSON();
      donneesAPersister[nomPropriete] = donneesPropriete;

      const { id, ...donnees } = donneesAPersister;
      return p.sauvegarde(id, donnees);
    });

  const ajouteDossierCourantSiNecessaire = (idHomologation) =>
    p.lis.une(idHomologation).then((h) => {
      if (typeof h === 'undefined') {
        return Promise.reject(
          new ErreurHomologationInexistante(
            `Homologation "${idHomologation}" non trouvée`
          )
        );
      }

      if (!h.dossierCourant()) {
        const idDossier = adaptateurUUID.genereUUID();
        const dossier = new Dossier({ id: idDossier });
        return ajouteAItemsDansHomologation(
          'dossiers',
          idHomologation,
          dossier
        ).then(() => dossier);
      }

      return Promise.resolve(h.dossierCourant());
    });

  const ajouteMesuresGeneralesAHomologation = (idHomologation, mesures) =>
    mesures.reduce(
      (acc, mesure) =>
        acc.then(() =>
          ajouteAItemsDansHomologation(
            'mesuresGenerales',
            idHomologation,
            mesure
          )
        ),
      Promise.resolve()
    );

  const remplaceMesuresSpecifiquesPourHomologation = (...params) =>
    remplaceProprieteHomologation('mesuresSpecifiques', ...params);

  const ajouteRisqueGeneralAHomologation = (...params) =>
    ajouteAItemsDansHomologation('risquesGeneraux', ...params);

  const homologationExiste = (...params) =>
    p.lis.celleAvecNomService(...params).then((h) => !!h);

  const valideDescriptionService = (
    idUtilisateur,
    donnees,
    idHomologationMiseAJour
  ) => {
    const { nomService } = donnees;

    if (!DescriptionService.proprietesObligatoiresRenseignees(donnees)) {
      return Promise.reject(
        new ErreurDonneesObligatoiresManquantes(
          'Certaines données obligatoires ne sont pas renseignées'
        )
      );
    }

    return homologationExiste(
      idUtilisateur,
      nomService,
      idHomologationMiseAJour
    ).then((homologationExistante) =>
      homologationExistante
        ? Promise.reject(
            new ErreurNomServiceDejaExistant(
              `Le nom du service "${nomService}" existe déjà pour une autre homologation`
            )
          )
        : Promise.resolve()
    );
  };

  const ajouteRolesResponsabilitesAHomologation = (...params) =>
    metsAJourProprieteHomologation('rolesResponsabilites', ...params);

  const ajouteAvisExpertCyberAHomologation = (...params) =>
    metsAJourProprieteHomologation('avisExpertCyber', ...params);

  const homologations = (idUtilisateur) =>
    p.lis.cellesDeUtilisateur(idUtilisateur);

  const ajouteDescriptionServiceAHomologation = (
    idUtilisateur,
    idHomologation,
    infos
  ) => {
    const donneesAPersister = (h) => h.donneesAPersister().toutes();

    const consigneEvenement = (h) => {
      adaptateurJournalMSS.consigneEvenement(
        new EvenementCompletudeServiceModifiee({
          idService: idHomologation,
          ...h.completudeMesures(),
        }).toJSON()
      );
      return h;
    };

    const envoieTrackingCompletude = (h) =>
      serviceTracking
        .completudeDesServicesPourUtilisateur({ homologations }, h.createur.id)
        .then((tauxCompletude) =>
          adaptateurTracking.envoieTrackingCompletudeService(
            h.createur.email,
            tauxCompletude
          )
        );

    const metsAJourHomologation = (h) =>
      valideDescriptionService(idUtilisateur, infos, h.id)
        .then(() =>
          metsAJourDescriptionServiceHomologation(donneesAPersister(h), infos)
        )
        .then(() => p.lis.une(idHomologation))
        .then(consigneEvenement)
        .then(envoieTrackingCompletude);

    return p.lis.une(idHomologation).then(metsAJourHomologation);
  };

  const ajouteMesuresAHomologation = (idHomologation, generales, specifiques) =>
    ajouteMesuresGeneralesAHomologation(idHomologation, generales)
      .then(() =>
        remplaceMesuresSpecifiquesPourHomologation(idHomologation, specifiques)
      )
      .then(() => p.lis.une(idHomologation))
      .then((h) =>
        adaptateurJournalMSS
          .consigneEvenement(
            new EvenementCompletudeServiceModifiee({
              idService: h.id,
              ...h.completudeMesures(),
            }).toJSON()
          )
          .then(() =>
            serviceTracking
              .completudeDesServicesPourUtilisateur(
                { homologations },
                h.createur.id
              )
              .then((tauxCompletude) =>
                adaptateurTracking.envoieTrackingCompletudeService(
                  h.createur.email,
                  tauxCompletude
                )
              )
          )
      );

  const toutesHomologations = () => p.lis.toutes();

  const enregistreDossierCourant = (idHomologation, dossier) =>
    ajouteAItemsDansHomologation('dossiers', idHomologation, dossier);

  const finaliseDossier = (idHomologation, dossier) =>
    enregistreDossierCourant(idHomologation, dossier).then(() => {
      const evenement = new EvenementNouvelleHomologationCreee({
        idService: idHomologation,
        dateHomologation: dossier.decision.dateHomologation,
        dureeHomologationMois: referentiel.nbMoisDecalage(
          dossier.decision.dureeValidite
        ),
      });

      return adaptateurJournalMSS.consigneEvenement(evenement.toJSON());
    });

  const nouvelleHomologation = (idUtilisateur, donneesHomologation) => {
    const idHomologation = adaptateurUUID.genereUUID();
    const idAutorisation = adaptateurUUID.genereUUID();

    return valideDescriptionService(
      idUtilisateur,
      donneesHomologation.descriptionService
    )
      .then(() => p.sauvegarde(idHomologation, donneesHomologation))
      .then(() =>
        adaptateurPersistance.ajouteAutorisation(idAutorisation, {
          idUtilisateur,
          idHomologation,
          idService: idHomologation,
          type: 'createur',
        })
      )
      .then(() => p.lis.une(idHomologation))
      .then((h) =>
        Promise.all([
          adaptateurJournalMSS.consigneEvenement(
            new EvenementNouveauServiceCree({
              idService: h.id,
              idUtilisateur,
            }).toJSON()
          ),
          adaptateurJournalMSS.consigneEvenement(
            new EvenementCompletudeServiceModifiee({
              idService: h.id,
              ...h.completudeMesures(),
            }).toJSON()
          ),
          homologations(idUtilisateur).then((hs) => {
            adaptateurTracking.envoieTrackingNouveauServiceCree(
              h.createur.email,
              { nombreServices: hs.length }
            );
          }),
          serviceTracking
            .completudeDesServicesPourUtilisateur(
              { homologations },
              idUtilisateur
            )
            .then((tauxCompletude) =>
              adaptateurTracking.envoieTrackingCompletudeService(
                h.createur.email,
                tauxCompletude
              )
            ),
        ])
      )
      .then(() => idHomologation);
  };

  const remplaceRisquesSpecifiquesPourHomologation = (...params) =>
    remplaceProprieteHomologation('risquesSpecifiques', ...params);

  const supprimeHomologation = (idHomologation) =>
    adaptateurPersistance
      .supprimeAutorisationsHomologation(idHomologation)
      .then(() => p.supprime(idHomologation))
      .then(() =>
        adaptateurJournalMSS.consigneEvenement(
          new EvenementServiceSupprime({ idService: idHomologation }).toJSON()
        )
      );

  const supprimeHomologationsCreeesPar = (
    idUtilisateur,
    idsHomologationsAConserver = []
  ) =>
    avecPMapPourChaqueElement(
      adaptateurPersistance.idsHomologationsCreeesParUtilisateur(
        idUtilisateur,
        idsHomologationsAConserver
      ),
      supprimeHomologation
    );

  const trouveIndexDisponible = (idCreateur, nomHomologationDupliquee) => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
    const nomCompatibleRegExp = nomHomologationDupliquee.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );
    const filtreNomDuplique = new RegExp(`^${nomCompatibleRegExp} (\\d+)$`);

    const maxMatch = (maxCourant, nomService) => {
      const index = parseInt(nomService.match(filtreNomDuplique)?.[1], 10);
      return index > maxCourant ? index : maxCourant;
    };

    const indexMax = (hs) => {
      const resultat = hs
        .map((h) => h.nomService())
        .reduce(maxMatch, -Infinity);
      return Math.max(0, resultat) + 1;
    };

    return p.lis.cellesDeUtilisateur(idCreateur).then(indexMax);
  };

  const dupliqueHomologation = (idHomologation) => {
    const duplique = (h) => {
      const nomHomologationADupliquer = `${h.nomService()} - Copie`;
      const idCreateur = h.createur.id;
      const donneesADupliquer = (index) =>
        h.donneesADupliquer(`${nomHomologationADupliquer} ${index}`);

      return trouveIndexDisponible(idCreateur, nomHomologationADupliquer)
        .then(donneesADupliquer)
        .then((donnees) => nouvelleHomologation(idCreateur, donnees));
    };

    return p.lis
      .une(idHomologation)
      .then((h) =>
        typeof h === 'undefined'
          ? Promise.reject(
              new ErreurHomologationInexistante(
                `Homologation "${idHomologation}" non trouvée`
              )
            )
          : h
      )
      .then(duplique);
  };

  return {
    ajouteAvisExpertCyberAHomologation,
    ajouteDescriptionServiceAHomologation,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAHomologation,
    ajouteRisqueGeneralAHomologation,
    ajouteRolesResponsabilitesAHomologation,
    dupliqueHomologation,
    finaliseDossier,
    homologation,
    homologationExiste,
    homologations,
    enregistreDossierCourant,
    nouvelleHomologation,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeHomologation,
    supprimeHomologationsCreeesPar,
    toutesHomologations,
    trouveIndexDisponible,
  };
};

module.exports = { creeDepot };
