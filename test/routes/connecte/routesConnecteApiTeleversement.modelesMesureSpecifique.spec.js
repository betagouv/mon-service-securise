import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';

import {
  ErreurFichierXlsInvalide,
  ErreurTeleversementInvalide,
  ErreurTeleversementInexistant,
} from '../../../src/erreurs.js';

import TeleversementModelesMesureSpecifique from '../../../src/modeles/televersement/televersementModelesMesureSpecifique.js';

describe('Les routes connecté de téléversement des modèles de mesure spécifique', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);

  it("vérifie que l'utilisateur est authentifié, 1 seul test suffit car le middleware est placé au niveau de l'instanciation du routeur", async () => {
    await testeur
      .middleware()
      .verifieRequeteExigeAcceptationCGU(testeur.app(), {
        method: 'post',
        url: '/api/televersement/modelesMesureSpecifique',
      });
  });

  describe('quand requête POST sur `/api/televersement/modelesMesureSpecifique`', () => {
    it('applique une protection de trafic', async () => {
      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'post',
        url: '/api/televersement/modelesMesureSpecifique',
      });
    });

    it("délègue la vérification de surface à l'adaptateur de vérification de fichier", async () => {
      let adaptateurAppele = false;
      let requeteRecue;
      testeur.lecteurDeFormData().extraisDonneesXLS = async (requete) => {
        adaptateurAppele = true;
        requeteRecue = requete;
      };

      await testeur.post('/api/televersement/modelesMesureSpecifique');

      expect(adaptateurAppele).to.be(true);
      expect(requeteRecue).not.to.be(undefined);
    });

    it('jette une erreur 400 si le fichier est invalide', async () => {
      testeur.lecteurDeFormData().extraisDonneesXLS = async () => {
        throw new ErreurFichierXlsInvalide();
      };

      const reponse = await testeur.post(
        '/api/televersement/modelesMesureSpecifique'
      );

      expect(reponse.status).to.be(400);
    });

    it("délègue la conversion du contenu à l'adaptateur de lecture de données téléversées", async () => {
      let adaptateurAppele = false;
      let bufferRecu;
      testeur.adaptateurTeleversementModelesMesureSpecifique().extraisDonneesTeleversees =
        async (buffer) => {
          adaptateurAppele = true;
          bufferRecu = buffer;
        };

      await testeur.post('/api/televersement/modelesMesureSpecifique');

      expect(adaptateurAppele).to.be(true);
      expect(bufferRecu).not.to.be(undefined);
    });

    it('délègue au dépôt de données la sauvegarde du téléversement', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.adaptateurTeleversementModelesMesureSpecifique().extraisDonneesTeleversees =
        async () => [{ description: 'Mesure téléversée' }];

      let donneesRecues;
      let idUtilisateurQuiTeleverse;
      testeur.depotDonnees().nouveauTeleversementModelesMesureSpecifique =
        async (idUtilisateurCourant, donnees) => {
          idUtilisateurQuiTeleverse = idUtilisateurCourant;
          donneesRecues = donnees;
        };

      await testeur.post('/api/televersement/modelesMesureSpecifique');

      expect(idUtilisateurQuiTeleverse).to.equal('123');
      expect(donneesRecues).to.eql([{ description: 'Mesure téléversée' }]);
    });
  });

  describe('quand requête GET sur `/api/televersement/modelesMesuresSpecifique`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
    });

    it("récupère le téléversement de l'utilisateur courant grâce au dépôt de données", async () => {
      let idDemande;
      testeur.depotDonnees().lisTeleversementModelesMesureSpecifique = async (
        idUtilisateur
      ) => {
        idDemande = idUtilisateur;
        return new TeleversementModelesMesureSpecifique([], {});
      };

      await testeur.get('/api/televersement/modelesMesureSpecifique');

      expect(idDemande).to.be('U1');
    });

    it("renvoie une erreur 404 si l'utilisateur n'a pas de téléversement en cours", async () => {
      testeur.depotDonnees().lisTeleversementModelesMesureSpecifique =
        async () => undefined;

      const reponse = await testeur.get(
        '/api/televersement/modelesMesureSpecifique'
      );

      expect(reponse.status).to.be(404);
    });
  });

  describe('quand requête DELETE sur `/api/televersement/modelesMesuresSpecifique`', () => {
    it("délègue au dépôt de données la suppression du téléversement de l'utilisateur", async () => {
      let idRecu;
      testeur.depotDonnees().supprimeTeleversementModelesMesureSpecifique =
        async (idUtilisateur) => {
          idRecu = idUtilisateur;
        };
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });

      await testeur.delete('/api/televersement/modelesMesureSpecifique');

      expect(idRecu).to.be('U1');
    });
  });

  describe('quand requête POST sur `/api/televersement/modelesMesureSpecifique/confirme`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur
        .referentiel()
        .recharge({ categoriesMesures: { gouvernance: 'Gouvernance' } });
      testeur.depotDonnees().lisTeleversementModelesMesureSpecifique =
        async () =>
          new TeleversementModelesMesureSpecifique(
            [{ description: 'une description 1', categorie: 'Gouvernance' }],
            testeur.referentiel()
          );
    });

    it("renvoie une erreur 404 si l'utilisateur n'a pas de téléversement en cours", async () => {
      testeur.depotDonnees().confirmeTeleversementModelesMesureSpecifique =
        async () => {
          throw new ErreurTeleversementInexistant();
        };

      const reponse = await testeur.post(
        '/api/televersement/modelesMesureSpecifique/confirme'
      );

      expect(reponse.status).to.be(404);
    });

    it('renvoie une erreur 400 si le téléversement en cours est invalide', async () => {
      testeur.depotDonnees().confirmeTeleversementModelesMesureSpecifique =
        async () => {
          throw new ErreurTeleversementInvalide();
        };

      const reponse = await testeur.post(
        '/api/televersement/modelesMesureSpecifique/confirme'
      );

      expect(reponse.status).to.be(400);
    });

    it('délègue au dépôt de données la confirmation du téléversement', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().confirmeTeleversementModelesMesureSpecifique =
        async (idUtilisateur) => {
          idUtilisateurRecu = idUtilisateur;
        };

      await testeur.post('/api/televersement/modelesMesureSpecifique/confirme');

      expect(idUtilisateurRecu).to.be('U1');
    });
  });
});
