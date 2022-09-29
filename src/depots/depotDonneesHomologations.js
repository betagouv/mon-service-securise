const {
  ErreurNomServiceDejaExistant,
  ErreurNomServiceManquant,
} = require('../erreurs');
const Homologation = require('../modeles/homologation');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance, adaptateurUUID, referentiel } = config;

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

  const ajouteMesureGeneraleAHomologation = (...params) => (
    ajouteAItemsDansHomologation('mesuresGenerales', ...params)
  );

  const ajouteRisqueGeneralAHomologation = (...params) => (
    ajouteAItemsDansHomologation('risquesGeneraux', ...params)
  );

  const homologationExiste = (...params) => (
    adaptateurPersistance.homologationAvecNomService(...params)
      .then((h) => !!h)
  );

  const valideDescriptionService = (idUtilisateur, { nomService }, idHomologationMiseAJour) => {
    if (typeof nomService !== 'string' || !nomService) {
      return Promise.reject(new ErreurNomServiceManquant('Le nom du service ne peut pas être vide'));
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
        idUtilisateur, idHomologation, type: 'createur',
      }))
      .then(() => idHomologation);
  };

  const remplaceMesuresSpecifiquesPourHomologation = (...params) => (
    remplaceProprieteHomologation('mesuresSpecifiques', ...params)
  );

  const remplaceRisquesSpecifiquesPourHomologation = (...params) => (
    remplaceProprieteHomologation('risquesSpecifiques', ...params)
  );

  const supprimeHomologation = (idHomologation) => adaptateurPersistance
    .supprimeAutorisationsHomologation(idHomologation)
    .then(() => adaptateurPersistance.supprimeHomologation(idHomologation));

  return {
    ajouteAvisExpertCyberAHomologation,
    ajouteDescriptionServiceAHomologation,
    ajouteMesureGeneraleAHomologation,
    ajouteRisqueGeneralAHomologation,
    ajouteRolesResponsabilitesAHomologation,
    homologation,
    homologationExiste,
    homologations,
    nouvelleHomologation,
    remplaceMesuresSpecifiquesPourHomologation,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeHomologation,
  };
};

module.exports = { creeDepot };
