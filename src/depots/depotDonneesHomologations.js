const {
  ErreurDonneesObligatoiresManquantes,
  ErreurNomServiceDejaExistant,
  ErreurServiceInexistant,
} = require('../erreurs');
const DescriptionService = require('../modeles/descriptionService');
const Dossier = require('../modeles/dossier');
const Service = require('../modeles/service');
const EvenementCompletudeServiceModifiee = require('../modeles/journalMSS/evenementCompletudeServiceModifiee');
const EvenementNouveauServiceCree = require('../modeles/journalMSS/evenementNouveauServiceCree');
const EvenementNouvelleHomologationCreee = require('../modeles/journalMSS/evenementNouvelleHomologationCreee');
const EvenementServiceSupprime = require('../modeles/journalMSS/evenementServiceSupprime');
const { avecPMapPourChaqueElement } = require('../utilitaires/pMap');

const creeDepot = (config = {}) => {
  const { adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID, referentiel } = config;

  const service = (idService) => adaptateurPersistance.service(idService)
    .then((S) => (S ? new Service(S, referentiel) : undefined));

  const ajouteAItemsDansService = (nomListeItems, idService, item) => (
    service(idService)
      .then((h) => {
        const donneesAPersister = h.donneesAPersister().toutes();
        donneesAPersister[nomListeItems] ||= [];

        const donneesItem = item.toJSON();
        const itemDejaDansDepot = donneesAPersister[nomListeItems]
          .find((i) => i.id === donneesItem.id);

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
      })
  );

  const metsAJourProprieteService = (nomPropriete, idOuService, propriete) => {
    const metsAJour = (s) => {
      s[nomPropriete] ||= {};

      const donneesPropriete = propriete.toJSON();
      Object.assign(s[nomPropriete], donneesPropriete);

      const { id, ...donnees } = s;
      return Promise.all([
        adaptateurPersistance.metsAJourHomologation(id, donnees),
        adaptateurPersistance.metsAJourService(id, donnees),
      ]);
    };

    const trouveDonneesService = (param) => (
      typeof param === 'object'
        ? Promise.resolve(param)
        : service(param).then((h) => h.donneesAPersister().toutes())
    );

    return trouveDonneesService(idOuService).then(metsAJour);
  };

  const metsAJourDescriptionServiceService = (serviceCible, informations) => (
    metsAJourProprieteService('descriptionService', serviceCible, informations)
  );

  const remplaceProprieteService = (nomPropriete, idService, propriete) => (
    service(idService)
      .then((s) => {
        const donneesAPersister = s.donneesAPersister().toutes();
        const donneesPropriete = propriete.toJSON();
        donneesAPersister[nomPropriete] = donneesPropriete;

        const { id, ...donnees } = donneesAPersister;
        return Promise.all([
          adaptateurPersistance.metsAJourHomologation(id, donnees),
          adaptateurPersistance.metsAJourService(id, donnees),
        ]);
      })
  );

  const ajouteDossierCourantSiNecessaire = (idService) => service(idService)
    .then((s) => {
      if (typeof s === 'undefined') {
        return Promise.reject(new ErreurServiceInexistant(
          `Service "${idService}" non trouvée`
        ));
      }

      if (!s.dossierCourant()) {
        const idDossier = adaptateurUUID.genereUUID();
        const dossier = new Dossier({ id: idDossier });
        return ajouteAItemsDansService('dossiers', idService, dossier)
          .then(() => dossier);
      }

      return Promise.resolve(s.dossierCourant());
    });

  const ajouteMesuresGeneralesAService = (idService, mesures) => (
    mesures.reduce(
      (acc, mesure) => acc.then(() => ajouteAItemsDansService('mesuresGenerales', idService, mesure)),
      Promise.resolve()
    ));

  const remplaceMesuresSpecifiquesPourService = (...params) => (
    remplaceProprieteService('mesuresSpecifiques', ...params)
  );

  const ajouteMesuresAService = (idService, generales, specifiques) => (
    ajouteMesuresGeneralesAService(idService, generales)
      .then(() => remplaceMesuresSpecifiquesPourService(idService, specifiques))
      .then(() => service(idService))
      .then((h) => adaptateurJournalMSS.consigneEvenement(
        new EvenementCompletudeServiceModifiee({
          idService: h.id,
          ...h.completudeMesures(),
        }).toJSON()
      ))
  );

  const ajouteRisqueGeneralAService = (...params) => (
    ajouteAItemsDansService('risquesGeneraux', ...params)
  );

  const serviceExiste = (...params) => (
    adaptateurPersistance.serviceAvecNomService(...params)
      .then((s) => !!s)
  );

  const valideDescriptionService = (idUtilisateur, donnees, idServiceMiseAJour) => {
    const { nomService } = donnees;

    if (!DescriptionService.proprietesObligatoiresRenseignees(donnees)) {
      return Promise.reject(new ErreurDonneesObligatoiresManquantes('Certaines données obligatoires ne sont pas renseignées'));
    }

    return serviceExiste(idUtilisateur, nomService, idServiceMiseAJour)
      .then((serviceExistante) => (
        serviceExistante
          ? Promise.reject(new ErreurNomServiceDejaExistant(
            `Le nom "${nomService}" existe déjà pour un autre service`
          ))
          : Promise.resolve()
      ));
  };

  const ajouteDescriptionServiceAService = (idUtilisateur, idService, infos) => {
    const donneesAPersister = (h) => h.donneesAPersister().toutes();

    const consigneEvenement = (h) => adaptateurJournalMSS.consigneEvenement(
      new EvenementCompletudeServiceModifiee({
        idService, ...h.completudeMesures(),
      }).toJSON()
    );

    const metsAJourService = (s) => valideDescriptionService(idUtilisateur, infos, s.id)
      .then(() => metsAJourDescriptionServiceService(donneesAPersister(s), infos))
      .then(() => service(idService))
      .then(consigneEvenement);

    return service(idService).then(metsAJourService);
  };

  const ajouteRolesResponsabilitesAService = (...params) => (
    metsAJourProprieteService('rolesResponsabilites', ...params)
  );

  const ajouteAvisExpertCyberAService = (...params) => (
    metsAJourProprieteService('avisExpertCyber', ...params)
  );

  const services = (idUtilisateur) => adaptateurPersistance.services(idUtilisateur)
    .then((lesServices) => lesServices
      .map((s) => new Service(s, referentiel))
      .sort((s1, s2) => s1.nomService().localeCompare(s2.nomService())));

  const tousServices = () => services();

  const enregistreDossierCourant = (idService, dossier) => (
    ajouteAItemsDansService('dossiers', idService, dossier)
  );

  const finaliseDossier = (idService, dossier) => (
    enregistreDossierCourant(idService, dossier)
      .then(() => {
        const evenement = new EvenementNouvelleHomologationCreee({
          idService,
          dateHomologation: dossier.decision.dateHomologation,
          dureeHomologationMois: referentiel.nbMoisDecalage(dossier.decision.dureeValidite),
        });

        return adaptateurJournalMSS.consigneEvenement(evenement.toJSON());
      })
  );

  const nouveauService = (idUtilisateur, donneesService) => {
    const idService = adaptateurUUID.genereUUID();
    const idAutorisation = adaptateurUUID.genereUUID();

    return valideDescriptionService(idUtilisateur, donneesService.descriptionService)
      .then(() => Promise.all([
        adaptateurPersistance.ajouteHomologation(idService, donneesService),
        adaptateurPersistance.ajouteService(idService, donneesService),
      ]))
      .then(() => adaptateurPersistance.ajouteAutorisation(idAutorisation, {
        idUtilisateur, idHomologation: idService, idService, type: 'createur',
      }))
      .then(() => service(idService))
      .then((s) => Promise.all([
        adaptateurJournalMSS.consigneEvenement(
          new EvenementNouveauServiceCree({ idService: s.id, idUtilisateur }).toJSON()
        ),
        adaptateurJournalMSS.consigneEvenement(
          new EvenementCompletudeServiceModifiee({
            idService: s.id, ...s.completudeMesures(),
          }).toJSON()
        ),
      ]))
      .then(() => idService);
  };

  const remplaceRisquesSpecifiquesPourService = (...params) => (
    remplaceProprieteService('risquesSpecifiques', ...params)
  );

  const supprimeService = (idService) => adaptateurPersistance
    .supprimeAutorisationsService(idService)
    .then(() => Promise.all([
      adaptateurPersistance.supprimeHomologation(idService),
      adaptateurPersistance.supprimeService(idService),
    ]))
    .then(() => adaptateurJournalMSS.consigneEvenement(
      new EvenementServiceSupprime({ idService })
        .toJSON()
    ));

  const supprimeServicesCreesPar = (idUtilisateur, idsServicesAConserver = []) => (
    avecPMapPourChaqueElement(
      adaptateurPersistance.idsServicesCreesParUtilisateur(
        idUtilisateur,
        idsServicesAConserver,
      ),
      supprimeService,
    )
  );

  const trouveIndexDisponible = (idCreateur, nomHomologationDupliquee) => {
    const filtreNomDuplique = new RegExp(`^${nomHomologationDupliquee} (\\d+)$`);
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

    return services(idCreateur).then(indexMax);
  };

  const dupliqueService = (idService) => {
    const duplique = (s) => {
      const nomServiceADupliquer = `${s.nomService()} - Copie`;
      const idCreateur = s.createur.id;
      const donneesADupliquer = (index) => s.donneesADupliquer(`${nomServiceADupliquer} ${index}`);

      return trouveIndexDisponible(idCreateur, nomServiceADupliquer)
        .then(donneesADupliquer)
        .then((donnees) => nouveauService(idCreateur, donnees));
    };

    return service(idService)
      .then((s) => (typeof s === 'undefined' ? Promise.reject(new ErreurServiceInexistant(
        `Service "${idService}" non trouvé`
      )) : s))
      .then(duplique);
  };

  return {
    ajouteAvisExpertCyberAService,
    ajouteDescriptionServiceAService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAService,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossier,
    serviceExiste,
    enregistreDossierCourant,
    nouveauService,
    remplaceRisquesSpecifiquesPourService,
    service,
    services,
    supprimeService,
    supprimeServicesCreesPar,
    tousServices,
    trouveIndexDisponible,
  };
};

module.exports = { creeDepot };
