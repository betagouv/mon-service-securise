const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('../testeurMSS');
const ParcoursUtilisateur = require('../../../src/modeles/parcoursUtilisateur');

describe('Le serveur MSS des routes privées /api/visiteGuidee/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  it("vérifie que l'utilisateur est authentifié sur toutes les routes", (done) => {
    // On vérifie une seule route privée.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié aux routes de la visite guidée.
    testeur.middleware().verifieRequeteExigeAcceptationCGU(
      {
        method: 'post',
        url: 'http://localhost:1234/api/visiteGuidee/termine',
      },
      done
    );
  });

  describe('quand requête POST sur /visiteGuidee/:idEtape/termine', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        etapesVisiteGuidee: {
          DECRIRE: { idEtapeSuivante: 'SECURISER' },
          SECURISER: { urlEtape: '/visiteGuidee/securiser' },
        },
      });
    });

    it("aseptise l'identifiant d'étape", (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['idEtape'],
        {
          method: 'post',
          url: 'http://localhost:1234/api/visiteGuidee/DECRIRE/termine',
        },
        done
      );
    });

    it("retourne une erreur HTTP 400 si l'ID d'étape n'existe pas", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        400,
        "Identifiant d'étape inconnu",
        {
          method: 'POST',
          url: 'http://localhost:1234/api/visiteGuidee/MAUVAIS_ID/termine',
        },
        done
      );
    });

    it("sauvegarde l'étape vue de la visite guidée", async () => {
      testeur.depotDonnees().lisParcoursUtilisateur = () =>
        new ParcoursUtilisateur(
          {
            etatVisiteGuidee: { dejaTerminee: false },
          },
          testeur.referentiel()
        );
      let parcoursUtilisateurPasse;
      testeur.depotDonnees().sauvegardeParcoursUtilisateur = (
        parcoursUtilisateur
      ) => {
        parcoursUtilisateurPasse = parcoursUtilisateur;
      };

      await axios.post(
        'http://localhost:1234/api/visiteGuidee/DECRIRE/termine'
      );

      expect(parcoursUtilisateurPasse.etatVisiteGuidee.etapesVues).to.eql([
        'DECRIRE',
      ]);
    });

    it("renvoi l'URL de l'étape suivante", async () => {
      const reponse = await axios.post(
        'http://localhost:1234/api/visiteGuidee/DECRIRE/termine'
      );

      expect(reponse.data.urlEtapeSuivante).to.be('/visiteGuidee/securiser');
    });

    it("renvoi une URL `null` s'il n'y a pas d'étape suivante", async () => {
      const reponse = await axios.post(
        'http://localhost:1234/api/visiteGuidee/SECURISER/termine'
      );

      expect(reponse.data.urlEtapeSuivante).to.be(null);
    });
  });

  describe('quand requête POST sur /visiteGuidee/termine', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        etapesVisiteGuidee: {
          DECRIRE: { idEtapeSuivante: 'SECURISER' },
        },
      });
    });

    it("sauvegarde l'état 'finalisé' de la visite guidée", async () => {
      testeur.depotDonnees().lisParcoursUtilisateur = () =>
        new ParcoursUtilisateur(
          {
            etatVisiteGuidee: { dejaTerminee: false, etapeCourante: 'DECRIRE' },
          },
          testeur.referentiel()
        );
      let parcoursUtilisateurPasse;
      testeur.depotDonnees().sauvegardeParcoursUtilisateur = (
        parcoursUtilisateur
      ) => {
        parcoursUtilisateurPasse = parcoursUtilisateur;
      };

      await axios.post('http://localhost:1234/api/visiteGuidee/termine');

      expect(parcoursUtilisateurPasse.etatVisiteGuidee.toJSON()).to.eql({
        dejaTerminee: true,
      });
    });
  });

  describe('quand requête POST sur /visiteGuidee/metsEnPause', () => {
    it('sauvegarde la pause de la visite guidée', async () => {
      testeur.depotDonnees().lisParcoursUtilisateur = () =>
        new ParcoursUtilisateur(
          {
            etatVisiteGuidee: { dejaTerminee: false, enPause: false },
          },
          testeur.referentiel()
        );
      let parcoursUtilisateurPasse;
      testeur.depotDonnees().sauvegardeParcoursUtilisateur = (
        parcoursUtilisateur
      ) => {
        parcoursUtilisateurPasse = parcoursUtilisateur;
      };

      await axios.post('http://localhost:1234/api/visiteGuidee/metsEnPause');

      expect(parcoursUtilisateurPasse.etatVisiteGuidee.enPause).to.be(true);
    });
  });

  describe('quand requête POST sur /visiteGuidee/reprends', () => {
    it('sauvegarde la reprise de la visite guidée', async () => {
      testeur.depotDonnees().lisParcoursUtilisateur = () =>
        new ParcoursUtilisateur(
          {
            etatVisiteGuidee: { dejaTerminee: false, enPause: true },
          },
          testeur.referentiel()
        );
      let parcoursUtilisateurPasse;
      testeur.depotDonnees().sauvegardeParcoursUtilisateur = (
        parcoursUtilisateur
      ) => {
        parcoursUtilisateurPasse = parcoursUtilisateur;
      };

      await axios.post('http://localhost:1234/api/visiteGuidee/reprends');

      expect(parcoursUtilisateurPasse.etatVisiteGuidee.enPause).to.be(false);
    });
  });
});
