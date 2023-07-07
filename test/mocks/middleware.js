const axios = require('axios');
const expect = require('expect.js');

const Homologation = require('../../src/modeles/homologation');

const verifieRequeteChangeEtat = (donneesEtat, requete, done) => {
  const verifieEgalite = (valeurConstatee, valeurReference, ...diagnostics) =>
    expect(`${[valeurConstatee, ...diagnostics].join(' ')}`).to.eql(
      `${[valeurReference, ...diagnostics].join(' ')}`
    );

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

let cguAcceptees;
let challengeMotDePasseEffectue = false;
let expirationCookieRepoussee = false;
let headersAvecNoncePositionnes = false;
let headersPositionnes = false;
let homologationTrouvee;
let idUtilisateurCourant;
let listesAseptisees = [];
let listeAdressesIPsAutorisee = [];
let parametresAseptises = [];
let rechercheServiceEffectuee = false;
let rechercheDossierCourantEffectuee = false;
let suppressionCookieEffectuee = false;
let verificationJWTMenee = false;
let verificationCGUMenee = false;

const middlewareFantaisie = {
  reinitialise: ({
    idUtilisateur,
    acceptationCGU = true,
    homologationARenvoyer = new Homologation({
      id: '456',
      descriptionService: { nomService: 'un service' },
    }),
  }) => {
    cguAcceptees = acceptationCGU;
    expirationCookieRepoussee = false;
    headersAvecNoncePositionnes = false;
    headersPositionnes = false;
    homologationTrouvee = homologationARenvoyer;
    idUtilisateurCourant = idUtilisateur;
    listesAseptisees = [];
    listeAdressesIPsAutorisee = [];
    parametresAseptises = [];
    rechercheServiceEffectuee = false;
    rechercheDossierCourantEffectuee = false;
    suppressionCookieEffectuee = false;
    verificationJWTMenee = false;
    verificationCGUMenee = false;
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

  idUtilisateurCourant: () => idUtilisateurCourant,

  positionneHeaders: (_requete, _reponse, suite) => {
    headersPositionnes = true;
    suite();
  },

  positionneHeadersAvecNonce: (_requete, _reponse, suite) => {
    headersAvecNoncePositionnes = true;
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

  trouveService: (requete, _reponse, suite) => {
    requete.idUtilisateurCourant = idUtilisateurCourant;
    requete.cguAcceptees = cguAcceptees;
    requete.homologation = homologationTrouvee;
    rechercheServiceEffectuee = true;
    suite();
  },

  trouveDossierCourant: (requete, _reponse, suite) => {
    requete.dossierCourant = requete.homologation.dossierCourant();
    rechercheDossierCourantEffectuee = true;
    suite();
  },

  verificationJWT: (requete, _reponse, suite) => {
    requete.idUtilisateurCourant = idUtilisateurCourant;
    requete.cguAcceptees = cguAcceptees;
    verificationJWTMenee = true;
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

  verifieRechercheService: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => rechercheServiceEffectuee },
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

  verifieRequetePositionneHeadersAvecNonce: (...params) => {
    verifieRequeteChangeEtat(
      { lectureEtat: () => headersAvecNoncePositionnes },
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
};

module.exports = middlewareFantaisie;
