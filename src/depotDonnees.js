const bcrypt = require('bcrypt');

const {
  ErreurEmailManquant,
  ErreurNomServiceDejaExistant,
  ErreurNomServiceManquant,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
} = require('./erreurs');
const Referentiel = require('./referentiel');
const adaptateurJWTParDefaut = require('./adaptateurs/adaptateurJWT');
const adaptateurUUIDParDefaut = require('./adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('./adaptateurs/fabriqueAdaptateurPersistance');
const FabriqueAutorisation = require('./modeles/autorisations/fabriqueAutorisation');
const CaracteristiquesComplementaires = require('./modeles/caracteristiquesComplementaires');
const Homologation = require('./modeles/homologation');
const PartiesPrenantes = require('./modeles/partiesPrenantes');
const DeveloppementFourniture = require('./modeles/partiesPrenantes/developpementFourniture');
const RolesResponsabilites = require('./modeles/rolesResponsabilites');
const Utilisateur = require('./modeles/utilisateur');

const creeDepot = (config = {}) => {
  const {
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
    referentiel = Referentiel.creeReferentiel(),
  } = config;

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
        return adaptateurPersistance.metsAJourHomologation(id, donnees);
      })
  );

  const metsAJourProprieteHomologation = (nomPropriete, idOuHomologation, propriete) => {
    const metsAJour = (h) => {
      h[nomPropriete] ||= {};

      const donneesPropriete = propriete.toJSON();
      Object.assign(h[nomPropriete], donneesPropriete);

      const { id, ...donnees } = h;
      return adaptateurPersistance.metsAJourHomologation(id, donnees);
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
        return adaptateurPersistance.metsAJourHomologation(id, donnees);
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

  const ajouteCaracteristiquesAHomologation = (...params) => (
    metsAJourProprieteHomologation('caracteristiquesComplementaires', ...params)
  );

  const ajouteDeveloppementFournitureAHomologation = (idHomologation, nomPartiePrenante) => {
    if (!nomPartiePrenante) {
      return Promise.resolve();
    }

    return adaptateurPersistance.homologation(idHomologation)
      .then((homologationTrouvee) => {
        const { partiesPrenantes = {} } = homologationTrouvee;
        partiesPrenantes.partiesPrenantes ||= [];
        partiesPrenantes.partiesPrenantes = partiesPrenantes.partiesPrenantes
          .filter((partiePrenante) => partiePrenante.type !== DeveloppementFourniture.name);
        partiesPrenantes.partiesPrenantes.push(
          { type: DeveloppementFourniture.name, nom: nomPartiePrenante }
        );
        return metsAJourProprieteHomologation('partiesPrenantes', homologationTrouvee, new PartiesPrenantes(partiesPrenantes, referentiel));
      });
  };

  const ajouteAuxCaracteristiquesComplementaires = (propriete) => (idHomologation, nom) => (
    adaptateurPersistance.homologation(idHomologation)
      .then((homologationTrouvee) => {
        const { caracteristiquesComplementaires = {} } = homologationTrouvee;
        caracteristiquesComplementaires[propriete] = nom;
        return metsAJourProprieteHomologation(
          'caracteristiquesComplementaires',
          homologationTrouvee,
          new CaracteristiquesComplementaires(caracteristiquesComplementaires, referentiel)
        );
      })
  );

  const ajouteStructureDeveloppementAHomologation = ajouteAuxCaracteristiquesComplementaires('structureDeveloppement');

  const ajouteHebergementAHomologation = ajouteAuxCaracteristiquesComplementaires('hebergeur');

  const ajoutePartiesPrenantesAHomologation = (...params) => {
    const [idHomologation, partiesPrenantes] = params;

    return metsAJourProprieteHomologation('partiesPrenantes', ...params)
      .then(() => metsAJourProprieteHomologation('rolesResponsabilites', idHomologation, new RolesResponsabilites(partiesPrenantes.toJSON())));
  };

  const ajouteAvisExpertCyberAHomologation = (...params) => (
    metsAJourProprieteHomologation('avisExpertCyber', ...params)
  );

  const homologations = (idUtilisateur) => adaptateurPersistance.homologations(idUtilisateur)
    .then((hs) => hs.map((h) => new Homologation(h, referentiel)));

  const nouvelleHomologation = (idUtilisateur, donneesDescriptionService) => {
    const idHomologation = adaptateurUUID.genereUUID();
    const idAutorisation = adaptateurUUID.genereUUID();
    const donnees = {
      idUtilisateur,
      descriptionService: donneesDescriptionService,
    };

    return valideDescriptionService(idUtilisateur, donneesDescriptionService)
      .then(() => adaptateurPersistance.ajouteHomologation(idHomologation, donnees))
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

  const utilisateur = (identifiant) => adaptateurPersistance.utilisateur(identifiant)
    .then((u) => (u ? new Utilisateur(u, adaptateurJWT) : undefined));

  const nouvelUtilisateur = (donneesUtilisateur) => new Promise((resolve, reject) => {
    const { email } = donneesUtilisateur;
    if (!email) throw new ErreurEmailManquant('Le champ email doit être renseigné');

    adaptateurPersistance.utilisateurAvecEmail(email)
      .then((u) => {
        if (u) {
          return reject(new ErreurUtilisateurExistant(
            'Utilisateur déjà existant pour cette adresse email'
          ));
        }

        const id = adaptateurUUID.genereUUID();
        donneesUtilisateur.idResetMotDePasse = adaptateurUUID.genereUUID();
        return bcrypt.hash(adaptateurUUID.genereUUID(), 10)
          .then((hash) => {
            donneesUtilisateur.motDePasse = hash;

            adaptateurPersistance.ajouteUtilisateur(id, donneesUtilisateur)
              .then(() => resolve(utilisateur(id)));
          });
      });
  });

  const utilisateurAFinaliser = (idReset) => adaptateurPersistance.utilisateurAvecIdReset(idReset)
    .then((u) => (u ? new Utilisateur(u, adaptateurJWT) : undefined));

  const utilisateurAuthentifie = (login, motDePasse) => (
    adaptateurPersistance.utilisateurAvecEmail(login)
      .then((u) => {
        const motDePasseStocke = u && u.motDePasse;
        const echecAuthentification = undefined;

        if (!motDePasseStocke) return new Promise((resolve) => resolve(echecAuthentification));

        return bcrypt.compare(motDePasse, motDePasseStocke)
          .then((authentificationReussie) => (authentificationReussie
            ? new Utilisateur(u, adaptateurJWT)
            : echecAuthentification
          ));
      })
  );

  const utilisateurExiste = (id) => utilisateur(id).then((u) => !!u);

  const metsAJourMotDePasse = (idUtilisateur, motDePasse) => (
    bcrypt.hash(motDePasse, 10)
      .then((hash) => adaptateurPersistance.metsAJourUtilisateur(
        idUtilisateur, { motDePasse: hash }
      ))
      .then(() => utilisateur(idUtilisateur))
  );

  const reinitialiseMotDePasse = (email) => adaptateurPersistance.utilisateurAvecEmail(email)
    .then((u) => {
      if (!u) return undefined;

      const idResetMotDePasse = adaptateurUUID.genereUUID();
      return adaptateurPersistance.metsAJourUtilisateur(u.id, { idResetMotDePasse })
        .then(() => utilisateur(u.id));
    });

  const { supprimeHomologation } = adaptateurPersistance;

  const supprimeIdResetMotDePassePourUtilisateur = (utilisateurAModifier) => (
    adaptateurPersistance.metsAJourUtilisateur(
      utilisateurAModifier.id, { idResetMotDePasse: undefined }
    )
      .then(() => utilisateur(utilisateurAModifier.id))
  );

  const supprimeUtilisateur = (id) => homologations(id)
    .then((hs) => hs.map((h) => adaptateurPersistance.supprimeHomologation(h.id)))
    .then((suppressions) => Promise.all(suppressions))
    .then(() => adaptateurPersistance.supprimeUtilisateur(id));

  const valideAcceptationCGUPourUtilisateur = (utilisateurAModifier) => (
    adaptateurPersistance.metsAJourUtilisateur(utilisateurAModifier.id, { cguAcceptees: true })
      .then(() => utilisateur(utilisateurAModifier.id))
  );

  const autorisations = (idUtilisateur) => adaptateurPersistance.autorisations(idUtilisateur)
    .then((as) => as.map((a) => FabriqueAutorisation.fabrique(a)));

  const accesAutorise = (idUtilisateur, idHomologation) => autorisations(idUtilisateur)
    .then((as) => as.some((a) => a.idHomologation === idHomologation));

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => {
    const verifieUtilisateurExiste = (id) => utilisateurExiste(id)
      .then((existe) => {
        if (!existe) throw new ErreurUtilisateurInexistant(`L'utilisateur "${id}" n'existe pas`);
      });

    return verifieUtilisateurExiste(idUtilisateurSource)
      .then(() => verifieUtilisateurExiste(idUtilisateurCible))
      .then(() => adaptateurPersistance
        .transfereAutorisations(idUtilisateurSource, idUtilisateurCible));
  };

  return {
    accesAutorise,
    ajouteAvisExpertCyberAHomologation,
    ajouteCaracteristiquesAHomologation,
    ajouteDescriptionServiceAHomologation,
    ajouteDeveloppementFournitureAHomologation,
    ajouteHebergementAHomologation,
    ajouteMesureGeneraleAHomologation,
    ajoutePartiesPrenantesAHomologation,
    ajouteRisqueGeneralAHomologation,
    ajouteStructureDeveloppementAHomologation,
    autorisations,
    homologation,
    homologationExiste,
    homologations,
    metsAJourMotDePasse,
    nouvelleHomologation,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    remplaceMesuresSpecifiquesPourHomologation,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeHomologation,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
    transfereAutorisations,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    valideAcceptationCGUPourUtilisateur,
  };
};

const creeDepotVide = () => {
  const adaptateurPersistance = fabriqueAdaptateurPersistance();
  return adaptateurPersistance.supprimeUtilisateurs()
    .then(() => adaptateurPersistance.supprimeHomologations())
    .then(() => adaptateurPersistance.supprimeAutorisations())
    .then(() => creeDepot({ adaptateurPersistance }));
};

module.exports = { creeDepot, creeDepotVide };
