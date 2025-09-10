import { beforeEach } from 'vitest';
import testeurMSS from '../testeurMSS.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.js';
import { UUID } from '../../../src/typesBasiques.js';
import {
  BrouillonService,
  ProprietesBrouillonService,
} from '../../../src/modeles/brouillonService.js';
import { ErreurBrouillonInexistant } from '../../../src/erreurs.js';

describe('Le serveur MSS des routes /api/brouillon-service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête POST sur `/api/brouillon-service`', () => {
    it('crée un brouillon de service et retourne son id', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().nouveauBrouillonService = async () => unUUID('3');

      const resultat = await testeur.post('/api/brouillon-service', {
        nomService: 'Le service',
      });

      expect(resultat.body.id).toBe(unUUID('3'));
    });

    it('retourne une erreur 400 si le nom de service est vide', async () => {
      const resultat = await testeur.post('/api/brouillon-service', {
        nomService: ' ',
      });

      expect(resultat.status).toBe(400);
    });
  });

  describe.each([
    {
      nomPropriete: 'siret',
      valeurCorrecte: '12312312312312',
      valeurIncorrecte: '123',
    },
    {
      nomPropriete: 'nomService',
      valeurCorrecte: 'Un service',
      valeurIncorrecte: '',
    },
  ])(
    'quand requête PUT sur `/api/brouillon-service/:id/:$nomPropriete`',
    ({ nomPropriete, valeurCorrecte, valeurIncorrecte }) => {
      let idBrouillonTest: UUID;

      beforeEach(() => {
        idBrouillonTest = unUUIDRandom();
        testeur.middleware().reinitialise({ idUtilisateur: unUUID('1') });
        testeur.depotDonnees().lisBrouillonService = async () =>
          new BrouillonService(idBrouillonTest, { nomService: 'Un service' });
        testeur.depotDonnees().sauvegardeBrouillonService = async () => {};
      });

      it('lis le brouillon via le dépôt de données', async () => {
        let donneesRecues: {
          idUtilisateur: UUID;
          idBrouillon: UUID;
        } | null = null;
        testeur.depotDonnees().lisBrouillonService = async (
          idUtilisateur: UUID,
          idBrouillon: UUID
        ) => {
          donneesRecues = { idUtilisateur, idBrouillon };
          return new BrouillonService(idBrouillonTest, {
            nomService: 'Un service',
          });
        };

        await testeur.put(
          `/api/brouillon-service/${idBrouillonTest}/${nomPropriete}`,
          {
            [nomPropriete]: valeurCorrecte,
          }
        );

        expect(donneesRecues!.idUtilisateur).toBe(unUUID('1'));
        expect(donneesRecues!.idBrouillon).toBe(idBrouillonTest);
      });

      it(`mets à jour la propriete ${nomPropriete} via le dépôt de données`, async () => {
        let donneesRecues: {
          idUtilisateur: UUID;
          brouillon: BrouillonService;
        } | null = null;
        testeur.depotDonnees().sauvegardeBrouillonService = async (
          idUtilisateur: UUID,
          brouillon: BrouillonService
        ) => {
          donneesRecues = { idUtilisateur, brouillon };
        };

        await testeur.put(
          `/api/brouillon-service/${idBrouillonTest}/${nomPropriete}`,
          {
            [nomPropriete]: valeurCorrecte,
          }
        );

        expect(donneesRecues!.idUtilisateur).toBe(unUUID('1'));
        expect(donneesRecues!.brouillon.id).toBe(idBrouillonTest);
        expect(
          donneesRecues!.brouillon.donneesAPersister()[
            nomPropriete as ProprietesBrouillonService
          ]
        ).toBe(valeurCorrecte);
      });

      it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
        const resultat = await testeur.put(
          `/api/brouillon-service/pas-un-uuid/${nomPropriete}`
        );

        expect(resultat.status).toBe(400);
      });

      it(`renvoie une erreur 400 si la propriété ${nomPropriete} passée n'est pas au bon format`, async () => {
        const resultat = await testeur.put(
          `/api/brouillon-service/${idBrouillonTest}/${nomPropriete}`,
          { [nomPropriete]: valeurIncorrecte }
        );

        expect(resultat.status).toBe(400);
      });

      it("renvoie une erreur 404 si le brouillon n'existe pas", async () => {
        testeur.depotDonnees().lisBrouillonService = async () => {
          throw new ErreurBrouillonInexistant();
        };

        const resultat = await testeur.put(
          `/api/brouillon-service/${idBrouillonTest}/${nomPropriete}`,
          {
            [nomPropriete]: valeurCorrecte,
          }
        );

        expect(resultat.status).toBe(404);
      });
    }
  );

  describe('quand requête POST sur `/api/brouillon-service/:id/finalise`', () => {
    it('délègue la finalisation du brouillon au dépôt de données', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: unUUID('1') });
      const idBrouillonTest = unUUIDRandom();
      testeur.depotDonnees().finaliseBrouillonService = async (
        idUtilisateur: UUID,
        idBrouillon: UUID
      ) => {
        expect(idUtilisateur).toBe(unUUID('1'));
        expect(idBrouillon).toBe(idBrouillonTest);

        return unUUID('3');
      };

      const reponse = await testeur.post(
        `/api/brouillon-service/${idBrouillonTest}/finalise`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body.idService).toBe(unUUID('3'));
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const resultat = await testeur.post(
        '/api/brouillon-service/pas-un-uuid/finalise'
      );

      expect(resultat.status).toBe(400);
    });

    it("renvoie une erreur 404 si le brouillon n'existe pas", async () => {
      testeur.depotDonnees().finaliseBrouillonService = async () => {
        throw new ErreurBrouillonInexistant();
      };

      const reponse = await testeur.post(
        `/api/brouillon-service/${unUUIDRandom()}/finalise`
      );

      expect(reponse.status).toBe(404);
    });
  });

  describe('quand requête GET sur `/api/brouillon-service/:id`', () => {
    it('retourne le brouillon', async () => {
      const idBrouillon = unUUIDRandom();

      testeur.depotDonnees().lisBrouillonService = async (
        _: UUID,
        idBrouillonDemande: UUID
      ) =>
        new BrouillonService(idBrouillonDemande, { nomService: 'Un service' });

      const reponse = await testeur.get(
        `/api/brouillon-service/${idBrouillon}`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        id: idBrouillon,
        nomService: 'Un service',
      });
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const reponse = await testeur.get('/api/brouillon-service/pas-un-uuid');

      expect(reponse.status).toBe(400);
    });

    it("renvoie une erreur 404 si le brouillon n'existe pas", async () => {
      testeur.depotDonnees().lisBrouillonService = async (
        _: UUID,
        __: UUID
      ) => {
        throw new ErreurBrouillonInexistant();
      };

      const reponse = await testeur.get(
        `/api/brouillon-service/${unUUIDRandom()}`
      );

      expect(reponse.status).toBe(404);
    });
  });
});
