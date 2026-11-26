import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import { creeReferentielVide } from '../../../src/referentiel.js';

import {
  ErreurTeleversementInvalide,
  ErreurTeleversementInexistant,
} from '../../../src/erreurs.js';

import TeleversementModelesMesureSpecifique from '../../../src/modeles/televersement/televersementModelesMesureSpecifique.js';

describe('Les routes connecté de téléversement des modèles de mesure spécifique', () => {
  const testeur = testeurMSS();
  beforeEach(() => {
    const referentiel = creeReferentielVide();
    referentiel.recharge({
      modelesMesureSpecifique: { nombreMaximumParUtilisateur: 3 },
    });
    return testeur.initialise(referentiel);
  });

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

    const unModeleTeleverse = () => ({
      description: 'Mon intitulé',
      descriptionLongue: 'Ma description',
      categorie: 'Gouvernance',
    });

    const posteLesModeles = (modelesMesureSpecifique) =>
      testeur.post('/api/televersement/modelesMesureSpecifique', {
        modelesMesureSpecifique,
      });

    describe('concernant la validation de la payload', () => {
      beforeEach(() => {
        testeur.depotDonnees().nouveauTeleversementModelesMesureSpecifique =
          async () => {};
      });

      it('jette une erreur 400 si la liste des modèles est absente', async () => {
        const reponse = await testeur.post(
          '/api/televersement/modelesMesureSpecifique'
        );

        expect(reponse.status).to.be(400);
      });

      it('jette une erreur 400 si la payload contient une propriété inconnue', async () => {
        const reponse = await testeur.post(
          '/api/televersement/modelesMesureSpecifique',
          { modelesMesureSpecifique: [unModeleTeleverse()], inconnue: 'X' }
        );

        expect(reponse.status).to.be(400);
      });

      it('jette une erreur 400 si un modèle contient une propriété inconnue', async () => {
        const reponse = await posteLesModeles([
          { ...unModeleTeleverse(), inconnue: 'X' },
        ]);

        expect(reponse.status).to.be(400);
      });

      it("jette une erreur 400 s'il manque une propriété à un modèle", async () => {
        const modeleSansCategorie = unModeleTeleverse();
        delete modeleSansCategorie.categorie;

        const reponse = await posteLesModeles([modeleSansCategorie]);

        expect(reponse.status).to.be(400);
      });

      it("jette une erreur 400 si une propriété n'est pas une chaîne de caractères", async () => {
        const reponse = await posteLesModeles([
          { ...unModeleTeleverse(), description: { $ne: '' } },
        ]);

        expect(reponse.status).to.be(400);
      });

      it("jette une erreur 400 si l'intitulé dépasse 1000 caractères", async () => {
        const reponse = await posteLesModeles([
          { ...unModeleTeleverse(), description: 'X'.repeat(1001) },
        ]);

        expect(reponse.status).to.be(400);
      });

      it('jette une erreur 400 si la description dépasse 2000 caractères', async () => {
        const reponse = await posteLesModeles([
          { ...unModeleTeleverse(), descriptionLongue: 'X'.repeat(2001) },
        ]);

        expect(reponse.status).to.be(400);
      });

      it('jette une erreur 400 si la catégorie dépasse 1000 caractères', async () => {
        const reponse = await posteLesModeles([
          { ...unModeleTeleverse(), categorie: 'X'.repeat(1001) },
        ]);

        expect(reponse.status).to.be(400);
      });

      it('jette une erreur 400 au-delà du nombre maximum de modèles par utilisateur', async () => {
        const reponse = await posteLesModeles(
          Array(4).fill(unModeleTeleverse())
        );

        expect(reponse.status).to.be(400);
      });

      it('accepte le nombre maximum de modèles par utilisateur', async () => {
        const reponse = await posteLesModeles(
          Array(3).fill(unModeleTeleverse())
        );

        expect(reponse.status).to.be(201);
      });

      it('laisse au rapport de téléversement le soin de signaler les erreurs métier, comme un intitulé manquant', async () => {
        const reponse = await posteLesModeles([
          { ...unModeleTeleverse(), description: '' },
        ]);

        expect(reponse.status).to.be(201);
      });
    });

    it('délègue au dépôt de données la sauvegarde des modèles reçus', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      let donneesRecues;
      let idUtilisateurQuiTeleverse;
      testeur.depotDonnees().nouveauTeleversementModelesMesureSpecifique =
        async (idUtilisateurCourant, donnees) => {
          idUtilisateurQuiTeleverse = idUtilisateurCourant;
          donneesRecues = donnees;
        };

      const reponse = await posteLesModeles([unModeleTeleverse()]);

      expect(reponse.status).to.be(201);
      expect(idUtilisateurQuiTeleverse).to.equal('123');
      expect(donneesRecues).to.eql([unModeleTeleverse()]);
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
