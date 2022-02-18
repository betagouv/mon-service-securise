const axios = require('axios');
const expect = require('expect.js');

const Homologation = require('../../src/modeles/homologation');

const verifieRequeteChangeEtat = (donneesEtat, requete, done) => {
  const { lectureEtat, etatInitial = false, etatFinal = true } = donneesEtat;
  expect(lectureEtat()).to.eql(etatInitial);

  axios(requete)
    .then(() => {
      expect(lectureEtat()).to.eql(etatFinal);
      done();
    })
    .catch((erreur) => {
      const erreurHTTP = erreur.response && erreur.response.status;
      if (erreurHTTP >= 400 && erreurHTTP < 500) {
        expect(lectureEtat()).to.eql(etatFinal);
        done();
      } else throw erreur;
    })
    .catch(done);
};

let authentificationBasiqueMenee = false;
let expirationCookieRepoussee = false;
let headersAvecNoncePositionnes = false;
let headersPositionnes = false;
let idUtilisateurCourant;
let listesAseptisees = [];
let parametresAseptises = [];
let rechercheHomologationEffectuee = false;
let suppressionCookieEffectuee = false;
let verificationJWTMenee = false;
let verificationCGUMenee = false;

const middlewareFantaisie = {
  reinitialise: (idUtilisateur) => {
    authentificationBasiqueMenee = false;
    expirationCookieRepoussee = false;
    headersAvecNoncePositionnes = false;
    headersPositionnes = false;
    idUtilisateurCourant = idUtilisateur;
    listesAseptisees = [];
    parametresAseptises = [];
    rechercheHomologationEffectuee = false;
    suppressionCookieEffectuee = false;
    verificationJWTMenee = false;
    verificationCGUMenee = false;
  },

  aseptise: (...nomsParametres) => (
    (requete, reponse, suite) => {
      parametresAseptises = nomsParametres;
      suite();
    }
  ),

  aseptiseListes: (listes) => (
    (requete, reponse, suite) => {
      listes.forEach(({ nom, proprietes }) => listesAseptisees.push({ nom, proprietes }));
      suite();
    }
  ),

  authentificationBasique: (requete, reponse, suite) => {
    authentificationBasiqueMenee = true;
    suite();
  },

  idUtilisateurCourant: () => idUtilisateurCourant,

  positionneHeaders: (requete, reponse, suite) => {
    headersPositionnes = true;
    suite();
  },

  positionneHeadersAvecNonce: (requete, reponse, suite) => {
    headersAvecNoncePositionnes = true;
    suite();
  },

  repousseExpirationCookie: (requete, reponse, suite) => {
    expirationCookieRepoussee = true;
    suite();
  },

  suppressionCookie: (requete, reponse, suite) => {
    suppressionCookieEffectuee = true;
    suite();
  },

  trouveHomologation: (requete, reponse, suite) => {
    requete.idUtilisateurCourant = idUtilisateurCourant;
    requete.homologation = new Homologation({ id: '456' });
    rechercheHomologationEffectuee = true;
    suite();
  },

  verificationJWT: (requete, reponse, suite) => {
    requete.idUtilisateurCourant = idUtilisateurCourant;
    verificationJWTMenee = true;
    suite();
  },

  verificationAcceptationCGU: (requete, reponse, suite) => {
    requete.idUtilisateurCourant = idUtilisateurCourant;
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

  verifieRechercheHomologation: (...params) => {
    verifieRequeteChangeEtat({ lectureEtat: () => rechercheHomologationEffectuee }, ...params);
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
