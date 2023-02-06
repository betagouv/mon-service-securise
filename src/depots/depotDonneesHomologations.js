const {
  ErreurDonneesObligatoiresManquantes,
  ErreurDossierNonFinalisable,
  ErreurHomologationInexistante,
  ErreurNomServiceDejaExistant,
} = require('../erreurs');
const DescriptionService = require('../modeles/descriptionService');
const Dossier = require('../modeles/dossier');
const Homologation = require('../modeles/homologation');
const EvenementCompletudeServiceModifiee = require('../modeles/journalMSS/evenementCompletudeServiceModifiee');
const EvenementNouveauServiceCree = require('../modeles/journalMSS/evenementNouveauServiceCree');
const EvenementServiceSupprime = require('../modeles/journalMSS/evenementServiceSupprime');
const { avecPMapPourChaqueElement } = require('../utilitaires/pMap');

const creeDepot = (config = {}) => {
  const { adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID, referentiel } = config;

  const homologation = (idHomologation) => adaptateurPersistance.homologation(idHomologation)
    .then((h) => (h ? new Homologation(h, referentiel) : undefined));

  const ajouteAItemsDansHomologation = (nomListeItems, idHomologation, item) => (
    adaptateurPersistance.homologation(idHomologation)
      .then((h) => {
        h[nomListeItems] ||= [];

        const donneesItem = item.toJSON();
        const itemDejaDansDepot = h[nomListeItems].find((i) => i.id === donneesItem.id);
        if (itemDejaDansDepot) {
          Object.assign(itemDejaDansDepot, donneesItem);
        } else {
          h[nomListeItems].push(donneesItem);
        }

        const { id, ...donnees } = h;
        return Promise.all([
          adaptateurPersistance.metsAJourHomologation(id, donnees),
          adaptateurPersistance.metsAJourService(id, donnees),
        ]);
      })
  );

  const metsAJourProprieteHomologation = (nomPropriete, idOuHomologation, propriete) => {
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

    const trouveDonneesHomologation = (param) => (
      typeof param === 'object'
        ? Promise.resolve(param)
        : adaptateurPersistance.homologation(param)
    );

    return trouveDonneesHomologation(idOuHomologation).then(metsAJour);
  };

  const metsAJourDescriptionServiceHomologation = (homologationCible, informations) => (
    metsAJourProprieteHomologation('descriptionService', homologationCible, informations)
  );

  const remplaceProprieteHomologation = (nomPropriete, idHomologation, propriete) => (
    adaptateurPersistance.homologation(idHomologation)
      .then((h) => {
        const donneesPropriete = propriete.toJSON();
        h[nomPropriete] = donneesPropriete;

        const { id, ...donnees } = h;
        return Promise.all([
          adaptateurPersistance.metsAJourHomologation(id, donnees),
          adaptateurPersistance.metsAJourService(id, donnees),
        ]);
      })
  );

  const ajouteDossierCourantSiNecessaire = (idHomologation) => homologation(idHomologation)
    .then((h) => {
      if (typeof h === 'undefined') {
        return Promise.reject(new ErreurHomologationInexistante(
          `Homologation "${idHomologation}" non trouvée`
        ));
      }

      if (!h.dossierCourant()) {
        const idDossier = adaptateurUUID.genereUUID();
        const dossier = new Dossier({ id: idDossier });
        return ajouteAItemsDansHomologation('dossiers', idHomologation, dossier)
          .then(() => dossier);
      }

      return Promise.resolve(h.dossierCourant());
    });

  const ajouteMesuresGeneralesAHomologation = (idHomologation, mesures) => (
    mesures.reduce(
      (acc, mesure) => acc.then(() => ajouteAItemsDansHomologation('mesuresGenerales', idHomologation, mesure)),
      Promise.resolve()
    ));

  const remplaceMesuresSpecifiquesPourHomologation = (...params) => (
    remplaceProprieteHomologation('mesuresSpecifiques', ...params)
  );

  const ajouteMesuresAHomologation = (idHomologation, generales, specifiques) => (
    ajouteMesuresGeneralesAHomologation(idHomologation, generales)
      .then(() => remplaceMesuresSpecifiquesPourHomologation(idHomologation, specifiques))
      .then(() => homologation(idHomologation))
      .then((h) => adaptateurJournalMSS.consigneEvenement(
        new EvenementCompletudeServiceModifiee({
          idService: h.id,
          ...h.completudeMesures(),
        }).toJSON()
      ))
  );

  const ajouteRisqueGeneralAHomologation = (...params) => (
    ajouteAItemsDansHomologation('risquesGeneraux', ...params)
  );

  const homologationExiste = (...params) => (
    adaptateurPersistance.homologationAvecNomService(...params)
      .then((h) => !!h)
  );

  const valideDescriptionService = (idUtilisateur, donnees, idHomologationMiseAJour) => {
    const { nomService } = donnees;

    if (!DescriptionService.proprietesObligatoiresRenseignees(donnees)) {
      return Promise.reject(new ErreurDonneesObligatoiresManquantes('Certaines données obligatoires ne sont pas renseignées'));
    }

    return homologationExiste(idUtilisateur, nomService, idHomologationMiseAJour)
      .then((homologationExistante) => (
        homologationExistante
          ? Promise.reject(new ErreurNomServiceDejaExistant(
            `Le nom du service "${nomService}" existe déjà pour une autre homologation`
          ))
          : Promise.resolve()
      ));
  };

  const ajouteDescriptionServiceAHomologation = (idUtilisateur, idHomologation, infos) => (
    adaptateurPersistance.homologation(idHomologation)
      .then((h) => (
        valideDescriptionService(idUtilisateur, infos, h.id)
          .then(() => metsAJourDescriptionServiceHomologation(h, infos))
          .then(() => homologation(idHomologation))
          .then((hAJour) => adaptateurJournalMSS.consigneEvenement(
            new EvenementCompletudeServiceModifiee({
              idService: idHomologation, ...hAJour.completudeMesures(),
            }).toJSON()
          ))
      ))
  );

  const ajouteRolesResponsabilitesAHomologation = (...params) => (
    metsAJourProprieteHomologation('rolesResponsabilites', ...params)
  );

  const ajouteAvisExpertCyberAHomologation = (...params) => (
    metsAJourProprieteHomologation('avisExpertCyber', ...params)
  );

  const homologations = (idUtilisateur) => adaptateurPersistance.homologations(idUtilisateur)
    .then((hs) => hs
      .map((h) => new Homologation(h, referentiel))
      .sort((h1, h2) => h1.nomService().localeCompare(h2.nomService())));

  const metsAJourDossierCourant = (idHomologation, dossier) => (
    ajouteDossierCourantSiNecessaire(idHomologation)
      .then((d) => {
        const donneesDossier = { ...d.toJSON(), ...dossier.toJSON() };
        const dossierMisAJour = new Dossier(donneesDossier, referentiel);
        if (dossierMisAJour.finalise && !dossierMisAJour.estComplet()) {
          throw new ErreurDossierNonFinalisable("Le dossier n'est pas complet et ne peut pas être finalisé");
        }
        return ajouteAItemsDansHomologation('dossiers', idHomologation, dossierMisAJour);
      })
  );

  const nouvelleHomologation = (idUtilisateur, donneesDescriptionService) => {
    const idHomologation = adaptateurUUID.genereUUID();
    const idAutorisation = adaptateurUUID.genereUUID();
    const donnees = {
      idUtilisateur,
      descriptionService: donneesDescriptionService,
    };

    return valideDescriptionService(idUtilisateur, donneesDescriptionService)
      .then(() => Promise.all([
        adaptateurPersistance.ajouteHomologation(idHomologation, donnees),
        adaptateurPersistance.ajouteService(idHomologation, donnees),
      ]))
      .then(() => adaptateurPersistance.ajouteAutorisation(idAutorisation, {
        idUtilisateur, idHomologation, idService: idHomologation, type: 'createur',
      }))
      .then(() => homologation(idHomologation))
      .then((h) => Promise.all([
        adaptateurJournalMSS.consigneEvenement(
          new EvenementNouveauServiceCree({ idService: h.id, idUtilisateur }).toJSON()
        ),
        adaptateurJournalMSS.consigneEvenement(
          new EvenementCompletudeServiceModifiee({
            idService: h.id, ...h.completudeMesures(),
          }).toJSON()
        ),
      ]))
      .then(() => idHomologation);
  };

  const remplaceRisquesSpecifiquesPourHomologation = (...params) => (
    remplaceProprieteHomologation('risquesSpecifiques', ...params)
  );

  const supprimeHomologation = (idHomologation) => adaptateurPersistance
    .supprimeAutorisationsHomologation(idHomologation)
    .then(() => Promise.all([
      adaptateurPersistance.supprimeHomologation(idHomologation),
      adaptateurPersistance.supprimeService(idHomologation),
    ]))
    .then(() => adaptateurJournalMSS.consigneEvenement(
      new EvenementServiceSupprime({ idService: idHomologation })
        .toJSON()
    ));

  const supprimeHomologationsCreeesPar = (idUtilisateur, idsHomologationsAConserver = []) => (
    avecPMapPourChaqueElement(
      adaptateurPersistance.idsHomologationsCreeesParUtilisateur(
        idUtilisateur,
        idsHomologationsAConserver,
      ),
      supprimeHomologation,
    )
  );

  const toutesHomologations = () => (
    adaptateurPersistance.toutesHomologations()
      .then((hs) => hs.map((h) => new Homologation(h, referentiel)))
  );

  return {
    ajouteAvisExpertCyberAHomologation,
    ajouteDescriptionServiceAHomologation,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAHomologation,
    ajouteRisqueGeneralAHomologation,
    ajouteRolesResponsabilitesAHomologation,
    homologation,
    homologationExiste,
    homologations,
    metsAJourDossierCourant,
    nouvelleHomologation,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeHomologation,
    supprimeHomologationsCreeesPar,
    toutesHomologations,
  };
};

module.exports = { creeDepot };
