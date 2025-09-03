import expect from 'expect.js';
import supertest from 'supertest';
import { Rubriques } from '../../src/modeles/autorisations/gestionDroits.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { unService } from '../constructeurs/constructeurService.js';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.js';

const { DECRIRE, SECURISER, HOMOLOGUER, RISQUES, CONTACTS } = Rubriques;
const NOMBRE_MAX_REDIRECTION_PAR_DEFAUT = 5;

const verifieRequeteChangeEtat = async (donneesEtat, app, requete) => {
  const verifieEgalite = (valeurConstatee, valeurReference, ...diagnostics) => {
    expect(
      `${[JSON.stringify(valeurConstatee), ...diagnostics].join(' ')}`
    ).to.eql(`${[JSON.stringify(valeurReference), ...diagnostics].join(' ')}`);
  };

  const { lectureEtat, etatInitial = false, etatFinal = true } = donneesEtat;
  const suffixeLectureEtat = `(sur appel à ${lectureEtat.toString()})`;

  verifieEgalite(lectureEtat(), etatInitial, suffixeLectureEtat);

  try {
    if (typeof requete === 'string')
      await supertest(app)
        .get(requete)
        .redirects(NOMBRE_MAX_REDIRECTION_PAR_DEFAUT);
    else {
      const methode = requete.method.toLowerCase();
      if (!(methode in supertest(app)))
        throw new Error(
          `La méthode ${methode} n'est pas un verbe HTTP correct`
        );
      await supertest(app)
        [requete.method.toLowerCase()](requete.url)
        .send(requete.data)
        .redirects(NOMBRE_MAX_REDIRECTION_PAR_DEFAUT);
    }
    verifieEgalite(lectureEtat(), etatFinal, suffixeLectureEtat);
  } catch (e) {
    const erreurHTTP = e.response?.status;
    if (!erreurHTTP || erreurHTTP >= 500) {
      throw e;
    }

    const suffixeErreurHTTP = `(sur erreur HTTP ${erreurHTTP})`;
    verifieEgalite(
      lectureEtat(),
      etatFinal,
      suffixeLectureEtat,
      suffixeErreurHTTP
    );
  }
};

let autorisationChargee;
let autorisationsChargees = false;
let cguAcceptees;
let challengeMotDePasseEffectue = false;
let droitVerifie = null;
let headersPositionnes = false;
let noncePositionne = false;
let serviceTrouve;
let idUtilisateurCourant;
let sourceAuthentification;
let listesAseptisees = [];
let listeAdressesIPsAutorisee = [];
let parametresAseptises = [];
let preferencesChargees = false;
let etatVisiteGuideeCharge = false;
let activationAgentConnectCharge = false;
let filtrageIpEstActif = false;
let rechercheDossierCourantEffectuee = false;
let suppressionCookieEffectuee = false;
let traficProtege = false;
let verificationJWTMenee = false;
let verificationCGUMenee = false;
let versionBuildeeChargee = false;
let typeRequeteCharge = null;
let idTokenAgentConnect;
let fonctionDeposeCookie;

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
    idTokenAgentConnectAUtiliser = undefined,
    fonctionDeposeCookieAAppeler = undefined,
  }) => {
    autorisationsChargees = false;
    cguAcceptees = acceptationCGU;
    droitVerifie = null;
    headersPositionnes = false;
    noncePositionne = false;
    serviceTrouve = serviceARenvoyer;
    idUtilisateurCourant = idUtilisateur;
    autorisationChargee = autorisationACharger;
    listesAseptisees = [];
    listeAdressesIPsAutorisee = [];
    parametresAseptises = [];
    preferencesChargees = false;
    etatVisiteGuideeCharge = false;
    activationAgentConnectCharge = false;
    filtrageIpEstActif = false;
    rechercheDossierCourantEffectuee = false;
    suppressionCookieEffectuee = false;
    traficProtege = false;
    verificationJWTMenee = false;
    verificationCGUMenee = false;
    challengeMotDePasseEffectue = false;
    versionBuildeeChargee = false;
    sourceAuthentification = authentificationAUtiliser;
    idTokenAgentConnect = idTokenAgentConnectAUtiliser;
    fonctionDeposeCookie = fonctionDeposeCookieAAppeler;
    typeRequeteCharge = null;
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

  chargeEtatAgentConnect: (_requete, _reponse, suite) => {
    activationAgentConnectCharge = true;
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

  positionneHeaders: (requete, _reponse, suite) => {
    if (fonctionDeposeCookie) {
      fonctionDeposeCookie(requete);
    }
    headersPositionnes = true;
    noncePositionne = true;
    suite();
  },

  protegeTrafic: () => (_requete, _reponse, suite) => {
    traficProtege = true;
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
    if (idTokenAgentConnect) {
      requete.session.AgentConnectIdToken = idTokenAgentConnect;
    }
    requete.sourceAuthentification = sourceAuthentification;
    requete.idUtilisateurCourant = idUtilisateurCourant;
    requete.cguAcceptees = cguAcceptees;
    verificationJWTMenee = true;
    suite();
  },

  redirigeVersUrlBase: (_requete, _reponse, suite) => {
    suite();
  },

  chargeTypeRequete: (typeRequete) => (_requete, _reponse, suite) => {
    typeRequeteCharge = typeRequete;
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

  verifieAseptisationParametres: async (nomsParametres, app, requete) =>
    verifieRequeteChangeEtat(
      {
        lectureEtat: () => parametresAseptises,
        etatInitial: [],
        etatFinal: nomsParametres,
      },
      app,
      requete
    ),

  verifieAdresseIP: async (listeAdressesIp, app, ...params) =>
    verifieRequeteChangeEtat(
      {
        lectureEtat: () => listeAdressesIPsAutorisee,
        etatInitial: [],
        etatFinal: listeAdressesIp,
      },
      app,
      ...params
    ),

  verifieChargementDesAutorisations: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => autorisationsChargees },
      app,
      ...params
    ),

  verifieChargementDesPreferences: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => preferencesChargees },
      app,
      ...params
    ),

  verifieFiltrageIp: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => filtrageIpEstActif },
      app,
      ...params
    ),

  verifieProtectionTrafic: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => traficProtege },
      app,
      ...params
    ),

  verifieRechercheService: async (droitsAttendus, app, ...params) =>
    verifieRequeteChangeEtat(
      {
        lectureEtat: () => droitVerifie,
        etatInitial: null,
        etatFinal: droitsAttendus,
      },
      app,
      ...params
    ),

  verifieRechercheDossierCourant: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => rechercheDossierCourantEffectuee },
      app,
      ...params
    ),

  verifieRequeteExigeAcceptationCGU: async (app, requete) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => verificationCGUMenee },
      app,
      requete
    ),

  verifieRequeteExigeJWT: async (app, requete) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => verificationJWTMenee },
      app,
      requete
    ),

  verifieRequeteChargeEtatVisiteGuidee: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => etatVisiteGuideeCharge },
      app,
      ...params
    ),

  verifieRequeteChargeActivationAgentConnect: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => activationAgentConnectCharge },
      app,
      ...params
    ),

  verifieRequeteExigeSuppressionCookie: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => suppressionCookieEffectuee },
      app,
      ...params
    ),

  verifieRequetePositionneHeaders: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => headersPositionnes },
      app,
      ...params
    ),

  verifieRequetePositionneNonce: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => noncePositionne },
      app,
      ...params
    ),

  verifieChallengeMotDePasse: async (app, requete) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => challengeMotDePasseEffectue },
      app,
      requete
    ),

  verifieChargementDeLaVersionBuildee: async (app, ...params) =>
    verifieRequeteChangeEtat(
      { lectureEtat: () => versionBuildeeChargee },
      app,
      ...params
    ),

  verifieTypeRequeteCharge: async (typeRequeteAttendu, app, ...params) =>
    verifieRequeteChangeEtat(
      {
        lectureEtat: () => typeRequeteCharge,
        etatInitial: null,
        etatFinal: typeRequeteAttendu,
      },
      app,
      ...params
    ),

  interdisLaMiseEnCache: (_requete, _reponse, suite) => {
    suite();
  },

  chargeFeatureFlags: (_requete, reponse, suite) => {
    reponse.locals.featureFlags = {
      avecBandeauMSC: false,
    };
    suite();
  },
};

export default middlewareFantaisie;
