const axios = require('axios');
const expect = require('expect.js');

const Homologation = require('../../src/modeles/homologation');

const verifieRequeteChangeEtat = (donneesEtat, requete, done) => {
  const verifieEgalite = (valeurConstatee, valeurReference, ...diagnostics) => (
    expect(`${[valeurConstatee, ...diagnostics].join(' ')}`)
      .to.eql(`${[valeurReference, ...diagnostics].join(' ')}`)
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
      verifieEgalite(lectureEtat(), etatFinal, suffixeLectureEtat, suffixeErreurHTTP);
      done();
    })
    .catch((e) => done(e.response?.data || e));
};

let authentificationBasiqueMenee = false;
let cguAcceptees;
let expirationCookieRepoussee = false;
let headersAvecNoncePositionnes = false;
let headersPositionnes = false;
let idUtilisateurCourant;
let listesAseptisees = [];
let parametresAseptises = [];
let rechercheServiceEffectuee = false;
let suppressionCookieEffectuee = false;
let verificationJWTMenee = false;
let verificationCGUMenee = false;

const middlewareFantaisie = {
  reinitialise: (idUtilisateur, acceptationCGU = true) => {
    authentificationBasiqueMenee = false;
    cguAcceptees = acceptationCGU;
    expirationCookieRepoussee = false;
    headersAvecNoncePositionnes = false;
    headersPositionnes = false;
    idUtilisateurCourant = idUtilisateur;
    listesAseptisees = [];
    parametresAseptises = [];
    rechercheServiceEffectuee = false;
    suppressionCookieEffectuee = false;
    verificationJWTMenee = false;
    verificationCGUMenee = false;
  },

  aseptise: (...nomsParametres) => (
    (_requete, _reponse, suite) => {
      parametresAseptises = nomsParametres;
      suite();
    }
  ),

  aseptiseListes: (listes) => (
    (_requete, _reponse, suite) => {
      listes.forEach(({ nom, proprietes }) => listesAseptisees.push({ nom, proprietes }));
      suite();
    }
  ),

  authentificationBasique: (_requete, _reponse, suite) => {
    authentificationBasiqueMenee = true;
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

  trouveHomologation: (requete, _reponse, suite) => {
    requete.idUtilisateurCourant = idUtilisateurCourant;
    requete.cguAcceptees = cguAcceptees;
    requete.homologation = new Homologation({
      id: '456',
      descriptionService: { nomService: 'un service' },
    });
    rechercheServiceEffectuee = true;
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
    suite();
  },

  verifieAseptisationListe: (nom, proprietesParametre) => {
    expect(listesAseptisees.some((liste) => liste?.nom === nom)).to.be(true);
    const listeRecherche = listesAseptisees.find((liste) => liste.nom === nom);
    expect(listeRecherche?.proprietes).to.eql(proprietesParametre);
  },

  verifieAseptisationParametres: (nomsParametres, ...params) => {
    verifieRequeteChangeEtat({
      lectureEtat: () => parametresAseptises,
      etatInitial: [],
      etatFinal: nomsParametres,
    }, ...params);
  },

  verifieRechercheService: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => rechercheServiceEffectuee }, ...params);
  },

  verifieRequeteExigeAcceptationCGU: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => verificationCGUMenee }, ...params);
  },

  verifieRequeteExigeAuthentificationBasique: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => authentificationBasiqueMenee }, ...params);
  },

  verifieRequeteExigeJWT: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => verificationJWTMenee }, ...params);
  },

  verifieRequeteExigeSuppressionCookie: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => suppressionCookieEffectuee }, ...params);
  },

  verifieRequetePositionneHeaders: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => headersPositionnes }, ...params);
  },

  verifieRequetePositionneHeadersAvecNonce: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => headersAvecNoncePositionnes }, ...params);
  },

  verifieRequeteRepousseExpirationCookie: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => expirationCookieRepoussee }, ...params);
  },
};

module.exports = middlewareFantaisie;
