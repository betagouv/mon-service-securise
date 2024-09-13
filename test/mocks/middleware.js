const axios = require('axios');
const expect = require('expect.js');

const {
  Rubriques: { DECRIRE, SECURISER, HOMOLOGUER, RISQUES, CONTACTS },
} = require('../../src/modeles/autorisations/gestionDroits');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');
const { unService } = require('../constructeurs/constructeurService');
const SourceAuthentification = require('../../src/modeles/sourceAuthentification');

const verifieRequeteChangeEtat = (donneesEtat, requete, done) => {
  const verifieEgalite = (valeurConstatee, valeurReference, ...diagnostics) => {
    expect(
      `${[JSON.stringify(valeurConstatee), ...diagnostics].join(' ')}`
    ).to.eql(`${[JSON.stringify(valeurReference), ...diagnostics].join(' ')}`);
  };

  const { lectureEtat, etatInitial = false, etatFinal = true } = donneesEtat;
  const suffixeLectureEtat = `(sur appel à ${lectureEtat.toString()})`;

  verifieEgalite(lectureEtat(), etatInitial, suffixeLectureEtat);

  axios(requete)
    .then(() => verifieEgalite(lectureEtat(), etatFinal, suffixeLectureEtat))
    .then(() => done())
    .catch((e) => {
      const erreurHTTP = e.response?.status;
      if (!erreurHTTP || erreurHTTP >= 500) throw e;

      const suffixeErreurHTTP = `(sur erreur HTTP ${erreurHTTP})`;
      verifieEgalite(
        lectureEtat(),
        etatFinal,
        suffixeLectureEtat,
        suffixeErreurHTTP
      );
      done();
    })
    .catch((e) => done(e.response?.data || e));
};

let autorisationChargee;
let autorisationsChargees = false;
let cguAcceptees;
let challengeMotDePasseEffectue = false;
let droitVerifie = null;
let expirationCookieRepoussee = false;
let headersPositionnes = false;
let serviceTrouve;
let idUtilisateurCourant;
let sourceAuthentification;
let listesAseptisees = [];
let listeAdressesIPsAutorisee = [];
let parametresAseptises = [];
let preferencesChargees = false;
let etatVisiteGuideeCharge = false;
let filtrageIpEstActif = false;
let rechercheDossierCourantEffectuee = false;
let suppressionCookieEffectuee = false;
let traficProtege = false;
let verificationJWTMenee = false;
let verificationCGUMenee = false;
let versionBuildeeChargee = false;

const middlewareFantaisie = {
  reinitialise: ({
    idUtilisateur,
    acceptationCGU = true,
    serviceARenvoyer = unService()
      .avecId('456')
      .avecNomService('un service')
      .construis(),
    autorisationACharger = uneAutorisation().construis(),
    authentificationAUtiliser = SourceAuthentification.MSS,
  }) => {
    autorisationsChargees = false;
    cguAcceptees = acceptationCGU;
    droitVerifie = null;
    expirationCookieRepoussee = false;
    headersPositionnes = false;
    serviceTrouve = serviceARenvoyer;
    idUtilisateurCourant = idUtilisateur;
    autorisationChargee = autorisationACharger;
    listesAseptisees = [];
    listeAdressesIPsAutorisee = [];
    parametresAseptises = [];
    preferencesChargees = false;
    etatVisiteGuideeCharge = false;
    filtrageIpEstActif = false;
    rechercheDossierCourantEffectuee = false;
    suppressionCookieEffectuee = false;
    traficProtege = false;
    verificationJWTMenee = false;
    verificationCGUMenee = false;
    challengeMotDePasseEffectue = false;
    versionBuildeeChargee = false;
    sourceAuthentification = authentificationAUtiliser;
  },

  ajouteVersionFichierCompiles: (_requete, _reponse, suite) => {
    versionBuildeeChargee = true;
    suite();
  },

  aseptise:
    (...nomsParametres) =>
    (_requete, _reponse, suite) => {
      parametresAseptises = nomsParametres;
      suite();
    },

  aseptiseListes: (listes) => (_requete, _reponse, suite) => {
    listes.forEach(({ nom, proprietes }) =>
      listesAseptisees.push({ nom, proprietes })
    );
    suite();
  },

  challengeMotDePasse: (_requete, _reponse, suite) => {
    challengeMotDePasseEffectue = true;
    suite();
  },

  chargeAutorisationsService: (requete, reponse, suite) => {
    reponse.locals.autorisationsService = {
      [DECRIRE]: {},
      [SECURISER]: {},
      [HOMOLOGUER]: {},
      [RISQUES]: {},
      [CONTACTS]: {},
      peutHomologuer: true,
    };
    autorisationsChargees = true;
    requete.autorisationService = autorisationChargee;
    suite();
  },

  chargeEtatVisiteGuidee: (_requete, reponse, suite) => {
    reponse.locals.etatVisiteGuidee = {
      toJSON: () => ({}),
      nombreEtapesRestantes: () => 2,
    };
    etatVisiteGuideeCharge = true;
    suite();
  },

  chargePreferencesUtilisateur: (_requete, reponse, suite) => {
    reponse.locals.preferencesUtilisateur = {};
    preferencesChargees = true;
    suite();
  },

  filtreIpAutorisees: () => (_requete, _reponse, suite) => {
    filtrageIpEstActif = true;
    suite();
  },

  idUtilisateurCourant: () => idUtilisateurCourant,

  positionneHeaders: (_requete, _reponse, suite) => {
    headersPositionnes = true;
    suite();
  },

  protegeTrafic: () => (_requete, _reponse, suite) => {
    traficProtege = true;
    suite();
  },

  repousseExpirationCookie: (_requete, _reponse, suite) => {
    expirationCookieRepoussee = true;
    suite();
  },

  suppressionCookie: (_requete, _reponse, suite) => {
    suppressionCookieEffectuee = true;
    suite();
  },

  trouveService: (listeDroits) => (requete, _reponse, suite) => {
    droitVerifie = Object.entries(listeDroits).map(([rubrique, niveau]) => ({
      niveau,
      rubrique,
    }));
    requete.idUtilisateurCourant = idUtilisateurCourant;
    requete.cguAcceptees = cguAcceptees;
    requete.service = serviceTrouve;
    suite();
  },

  trouveDossierCourant: (requete, _reponse, suite) => {
    requete.dossierCourant = requete.service.dossierCourant();
    rechercheDossierCourantEffectuee = true;
    suite();
  },

  verificationJWT: (requete, _reponse, suite) => {
    requete.sourceAuthentification = sourceAuthentification;
    requete.idUtilisateurCourant = idUtilisateurCourant;
    requete.cguAcceptees = cguAcceptees;
    verificationJWTMenee = true;
    suite();
  },

  verificationModeMaintenance: (_requete, _reponse, suite) => {
    suite();
  },

  verificationAcceptationCGU: (requete, _reponse, suite) => {
    requete.idUtilisateurCourant = idUtilisateurCourant;
    requete.cguAcceptees = cguAcceptees;
    verificationCGUMenee = true;
    // Réplique le comportement du middleware CGU de PROD,
    // qui appelle le middleware de vérification JWT.
    verificationJWTMenee = true;
    suite();
  },

  verificationAddresseIP: (listeAdressesIPs) => (_requete, _reponse, suite) => {
    listeAdressesIPsAutorisee = listeAdressesIPs;
    suite();
  },

  verifieAseptisationListe: (nom, proprietesParametre) => {
    expect(listesAseptisees.some((liste) => liste?.nom === nom)).to.be(true);
    const listeRecherche = listesAseptisees.find((liste) => liste.nom === nom);
    expect(listeRecherche?.proprietes).to.eql(proprietesParametre);
  },

  verifieAseptisationParametres: (nomsParametres, ...params) => {
    verifieRequeteChangeEtat(
      {
        lectureEtat: () => parametresAseptises,
        etatInitial: [],
        etatFinal: nomsParametres,
      },
      ...params
    );
  },

  verifieAdresseIP: (listeAdressesIp, ...params) => {
    verifieRequeteChangeEtat(
      {
        lectureEtat: () => listeAdressesIPsAutorisee,
        etatInitial: [],
        etatFinal: listeAdressesIp,
      },
      ...params
    );
  },

  verifieChargementDesAutorisations: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => autorisationsChargees },
      ...params
    );
  },

  verifieChargementDesPreferences: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => preferencesChargees },
      ...params
    );
  },

  verifieFiltrageIp: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => filtrageIpEstActif },
      ...params
    );
  },

  verifieProtectionTrafic: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => traficProtege }, ...params);
  },

  verifieRechercheService: (droitsAttendus, ...params) => {
    verifieRequeteChangeEtat(
      {
        lectureEtat: () => droitVerifie,
        etatInitial: null,
        etatFinal: droitsAttendus,
      },
      ...params
    );
  },

  verifieRechercheDossierCourant: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => rechercheDossierCourantEffectuee },
      ...params
    );
  },

  verifieRequeteExigeAcceptationCGU: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => verificationCGUMenee },
      ...params
    );
  },

  verifieRequeteExigeJWT: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => verificationJWTMenee },
      ...params
    );
  },

  verifieRequeteChargeEtatVisiteGuidee: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => etatVisiteGuideeCharge },
      ...params
    );
  },

  verifieRequeteExigeSuppressionCookie: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => suppressionCookieEffectuee },
      ...params
    );
  },

  verifieRequetePositionneHeaders: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => headersPositionnes },
      ...params
    );
  },

  verifieRequeteRepousseExpirationCookie: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => expirationCookieRepoussee },
      ...params
    );
  },

  verifieChallengeMotDePasse: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => challengeMotDePasseEffectue },
      ...params
    );
  },

  verifieChargementDeLaVersionBuildee: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => versionBuildeeChargee },
      ...params
    );
  },
};

module.exports = middlewareFantaisie;
