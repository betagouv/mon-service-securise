import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import ParcoursUtilisateur from '../../../src/modeles/parcoursUtilisateur.js';

describe('Le serveur MSS des routes privées /api/visiteGuidee/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  it("vérifie que l'utilisateur est authentifié sur toutes les routes", async () => {
    // On vérifie une seule route privée.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié aux routes de la visite guidée.
    await testeur
      .middleware()
      .verifieRequeteExigeAcceptationCGU(testeur.app(), {
        method: 'post',
        url: '/api/visiteGuidee/termine',
      });
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

    it("aseptise l'identifiant d'étape", async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['idEtape'], testeur.app(), {
          method: 'post',
          url: '/api/visiteGuidee/DECRIRE/termine',
        });
    });

    it("retourne une erreur HTTP 400 si l'ID d'étape n'existe pas", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        "Identifiant d'étape inconnu",
        {
          method: 'POST',
          url: '/api/visiteGuidee/MAUVAIS_ID/termine',
        }
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

      await testeur.post('/api/visiteGuidee/DECRIRE/termine');

      expect(parcoursUtilisateurPasse.etatVisiteGuidee.etapesVues).to.eql([
        'DECRIRE',
      ]);
    });

    it("renvoi l'URL de l'étape suivante", async () => {
      const reponse = await testeur.post('/api/visiteGuidee/DECRIRE/termine');

      expect(reponse.body.urlEtapeSuivante).to.be('/visiteGuidee/securiser');
    });

    it("renvoi une URL `null` s'il n'y a pas d'étape suivante", async () => {
      const reponse = await testeur.post('/api/visiteGuidee/SECURISER/termine');

      expect(reponse.body.urlEtapeSuivante).to.be(null);
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

      await testeur.post('/api/visiteGuidee/termine');

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

      await testeur.post('/api/visiteGuidee/metsEnPause');

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

      await testeur.post('/api/visiteGuidee/reprends');

      expect(parcoursUtilisateurPasse.etatVisiteGuidee.enPause).to.be(false);
    });
  });

  it('quand requête POST sur /visiteGuidee/reprends, sauvegarde la réinitialisation de la visite guidée', async () => {
    testeur.depotDonnees().lisParcoursUtilisateur = () =>
      new ParcoursUtilisateur(
        {
          etatVisiteGuidee: { dejaTerminee: true, enPause: false },
        },
        testeur.referentiel()
      );
    let parcoursUtilisateurPasse;
    testeur.depotDonnees().sauvegardeParcoursUtilisateur = (
      parcoursUtilisateur
    ) => {
      parcoursUtilisateurPasse = parcoursUtilisateur;
    };

    await testeur.post('/api/visiteGuidee/reinitialise');

    expect(parcoursUtilisateurPasse.etatVisiteGuidee.dejaTerminee).to.be(false);
  });
});
