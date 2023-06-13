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

const creeDepot = (config = {}) => {
  const {
    adaptateurJournalMSS,
    adaptateurPersistance,
    adaptateurUUID,
    referentiel,
  } = config;

  const homologation = (idHomologation) =>
    adaptateurPersistance
      .homologation(idHomologation)
      .then((h) => (h ? new Homologation(h, referentiel) : undefined));

  const ajouteAItemsDansHomologation = (nomListeItems, idHomologation, item) =>
    homologation(idHomologation).then((h) => {
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
      return Promise.all([
        adaptateurPersistance.metsAJourHomologation(id, donnees),
        adaptateurPersistance.metsAJourService(id, donnees),
      ]);
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
      return Promise.all([
        adaptateurPersistance.metsAJourHomologation(id, donnees),
        adaptateurPersistance.metsAJourService(id, donnees),
      ]);
    };

    const trouveDonneesHomologation = (param) =>
      typeof param === 'object'
        ? Promise.resolve(param)
        : homologation(param).then((h) => h.donneesAPersister().toutes());

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
    homologation(idHomologation).then((h) => {
      const donneesAPersister = h.donneesAPersister().toutes();
      const donneesPropriete = propriete.toJSON();
      donneesAPersister[nomPropriete] = donneesPropriete;

      const { id, ...donnees } = donneesAPersister;
      return Promise.all([
        adaptateurPersistance.metsAJourHomologation(id, donnees),
        adaptateurPersistance.metsAJourService(id, donnees),
      ]);
    });

  const ajouteDossierCourantSiNecessaire = (idHomologation) =>
    homologation(idHomologation).then((h) => {
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

  const ajouteMesuresAHomologation = (idHomologation, generales, specifiques) =>
    ajouteMesuresGeneralesAHomologation(idHomologation, generales)
      .then(() =>
        remplaceMesuresSpecifiquesPourHomologation(idHomologation, specifiques)
      )
      .then(() => homologation(idHomologation))
      .then((h) =>
        adaptateurJournalMSS.consigneEvenement(
          new EvenementCompletudeServiceModifiee({
            idService: h.id,
            ...h.completudeMesures(),
          }).toJSON()
        )
      );

  const ajouteRisqueGeneralAHomologation = (...params) =>
    ajouteAItemsDansHomologation('risquesGeneraux', ...params);

  const homologationExiste = (...params) =>
    adaptateurPersistance
      .homologationAvecNomService(...params)
      .then((h) => !!h);

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

  const ajouteDescriptionServiceAHomologation = (
    idUtilisateur,
    idHomologation,
    infos
  ) => {
    const donneesAPersister = (h) => h.donneesAPersister().toutes();

    const consigneEvenement = (h) =>
      adaptateurJournalMSS.consigneEvenement(
        new EvenementCompletudeServiceModifiee({
          idService: idHomologation,
          ...h.completudeMesures(),
        }).toJSON()
      );

    const metsAJourHomologation = (h) =>
      valideDescriptionService(idUtilisateur, infos, h.id)
        .then(() =>
          metsAJourDescriptionServiceHomologation(donneesAPersister(h), infos)
        )
        .then(() => homologation(idHomologation))
        .then(consigneEvenement);

    return homologation(idHomologation).then(metsAJourHomologation);
  };

  const ajouteRolesResponsabilitesAHomologation = (...params) =>
    metsAJourProprieteHomologation('rolesResponsabilites', ...params);

  const ajouteAvisExpertCyberAHomologation = (...params) =>
    metsAJourProprieteHomologation('avisExpertCyber', ...params);

  const homologations = (idUtilisateur) =>
    adaptateurPersistance
      .homologations(idUtilisateur)
      .then((hs) =>
        hs
          .map((h) => new Homologation(h, referentiel))
          .sort((h1, h2) => h1.nomService().localeCompare(h2.nomService()))
      );

  const toutesHomologations = () => homologations();

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
      .then(() =>
        Promise.all([
          adaptateurPersistance.ajouteHomologation(
            idHomologation,
            donneesHomologation
          ),
          adaptateurPersistance.ajouteService(
            idHomologation,
            donneesHomologation
          ),
        ])
      )
      .then(() =>
        adaptateurPersistance.ajouteAutorisation(idAutorisation, {
          idUtilisateur,
          idHomologation,
          idService: idHomologation,
          type: 'createur',
        })
      )
      .then(() => homologation(idHomologation))
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
        ])
      )
      .then(() => idHomologation);
  };

  const remplaceRisquesSpecifiquesPourHomologation = (...params) =>
    remplaceProprieteHomologation('risquesSpecifiques', ...params);

  const supprimeHomologation = (idHomologation) =>
    adaptateurPersistance
      .supprimeAutorisationsHomologation(idHomologation)
      .then(() =>
        Promise.all([
          adaptateurPersistance.supprimeHomologation(idHomologation),
          adaptateurPersistance.supprimeService(idHomologation),
        ])
      )
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

    return homologations(idCreateur).then(indexMax);
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

    return homologation(idHomologation)
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

  const nombreMoyenContributeursPourUtilisateur = (idUtilisateur) =>
    homologations(idUtilisateur).then((_homologations) =>
      _homologations.length === 0
        ? 0
        : Math.floor(
            _homologations.reduce(
              (accumulateur, _homologation) =>
                accumulateur + _homologation.contributeurs.length,
              0
            ) / _homologations.length
          )
    );

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
    nombreMoyenContributeursPourUtilisateur,
  };
};

module.exports = { creeDepot };
