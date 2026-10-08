import testeurMSS from '../testeurMSS.js';
import { UUID } from '../../../src/typesBasiques.ts';
import { AdminOrganisations } from '../../../src/modeles/gestionOrganisations/adminOrganisations.ts';
import Superviseur from '../../../src/modeles/superviseur.ts';

describe('Le serveur MSS des routes privées /api/admin/groupes-entites', () => {
  const testeur = testeurMSS();

  const declareAdminSur = async (idUtilisateur: string, sirets: string[]) => {
    await testeur.depotDonnees().sauvegardeAdminOrganisations(
      AdminOrganisations.hydrate({
        idUtilisateur: idUtilisateur as UUID,
        entitesAdministrees: sirets.map((siret) => ({ siret })),
      })
    );
  };

  beforeEach(async () => {
    await testeur.initialise();
    testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
    await declareAdminSur('U1', ['11111111100011', '22222222200022']);
  });

  describe('quand requête GET sur `/api/admin/groupes-entites`', () => {
    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'get',
          url: '/api/admin/groupes-entites',
        });
    });

    it('répond 404 si le feature flag est désactivé', async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecGroupesEntites: () => false,
      });

      const reponse = await testeur.get('/api/admin/groupes-entites');

      expect(reponse.status).toBe(404);
    });

    it("répond 403 si l'utilisateur n'est ni admin ni superviseur", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U-SANS-PERIMETRE' });

      const reponse = await testeur.get('/api/admin/groupes-entites');

      expect(reponse.status).toBe(403);
    });

    it('autorise un superviseur', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: 'S1' });
      await testeur.depotDonnees().sauvegardeSuperviseur(
        Superviseur.hydrate({
          idUtilisateur: 'S1' as UUID,
          entitesSupervisees: [{ siret: '11111111100011' }],
        })
      );

      const reponse = await testeur.get('/api/admin/groupes-entites');

      expect(reponse.status).toBe(200);
    });

    it("renvoie une liste vide si l'utilisateur n'a aucun groupe", async () => {
      const reponse = await testeur.get('/api/admin/groupes-entites');

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual([]);
    });
  });

  describe('quand requête POST sur `/api/admin/groupes-entites`', () => {
    it("crée le groupe pour l'utilisateur courant et le renvoie", async () => {
      const reponse = await testeur.post('/api/admin/groupes-entites', {
        libelle: 'Région Nord',
      });

      expect(reponse.status).toBe(201);
      const [groupe] = await testeur
        .depotDonnees()
        .lisGroupesEntitesDe('U1' as UUID);
      expect(reponse.body).toEqual({
        id: groupe.donnees().id,
        libelle: 'Région Nord',
        siretsAssocies: [],
      });
    });

    it('refuse un libellé vide', async () => {
      const reponse = await testeur.post('/api/admin/groupes-entites', {
        libelle: '   ',
      });

      expect(reponse.status).toBe(400);
    });

    it('refuse un libellé de plus de 200 caractères', async () => {
      const reponse = await testeur.post('/api/admin/groupes-entites', {
        libelle: 'a'.repeat(201),
      });

      expect(reponse.status).toBe(400);
    });

    it("répond 422 si l'utilisateur a déjà un groupe avec ce libellé", async () => {
      await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.post('/api/admin/groupes-entites', {
        libelle: 'Région Nord',
      });

      expect(reponse.status).toBe(422);
      expect(reponse.body).toEqual({
        erreur: { code: 'LIBELLE_GROUPE_DEJA_EXISTANT' },
      });
    });
  });

  describe('quand requête PUT sur `/api/admin/groupes-entites/:id`', () => {
    it("renomme le groupe de l'utilisateur courant", async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.put(
        `/api/admin/groupes-entites/${groupe.donnees().id}`,
        { libelle: 'Région Sud' }
      );

      expect(reponse.status).toBe(200);
      const [groupeLu] = await testeur
        .depotDonnees()
        .lisGroupesEntitesDe('U1' as UUID);
      expect(groupeLu.donnees().libelle).toBe('Région Sud');
    });

    it("répond 404 et ne renomme pas le groupe d'un autre utilisateur", async () => {
      await declareAdminSur('U2', ['11111111100011']);
      const groupeDeU2 = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U2' as UUID, 'Région Nord');

      const reponse = await testeur.put(
        `/api/admin/groupes-entites/${groupeDeU2.donnees().id}`,
        { libelle: 'Piraté' }
      );

      expect(reponse.status).toBe(404);
      const [groupeLu] = await testeur
        .depotDonnees()
        .lisGroupesEntitesDe('U2' as UUID);
      expect(groupeLu.donnees().libelle).toBe('Région Nord');
    });

    it("refuse un identifiant qui n'est pas un UUID", async () => {
      const reponse = await testeur.put(
        '/api/admin/groupes-entites/pas-un-uuid',
        {
          libelle: 'Région Sud',
        }
      );

      expect(reponse.status).toBe(400);
    });
  });

  describe('quand requête DELETE sur `/api/admin/groupes-entites/:id`', () => {
    it("supprime le groupe de l'utilisateur courant", async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.delete(
        `/api/admin/groupes-entites/${groupe.donnees().id}`
      );

      expect(reponse.status).toBe(200);
      expect(
        await testeur.depotDonnees().lisGroupesEntitesDe('U1' as UUID)
      ).toEqual([]);
    });

    it("répond 404 et ne supprime pas le groupe d'un autre utilisateur", async () => {
      await declareAdminSur('U2', ['11111111100011']);
      const groupeDeU2 = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U2' as UUID, 'Région Nord');

      const reponse = await testeur.delete(
        `/api/admin/groupes-entites/${groupeDeU2.donnees().id}`
      );

      expect(reponse.status).toBe(404);
      expect(
        await testeur.depotDonnees().lisGroupesEntitesDe('U2' as UUID)
      ).toHaveLength(1);
    });

    it("refuse un identifiant qui n'est pas un UUID", async () => {
      const reponse = await testeur.delete(
        '/api/admin/groupes-entites/pas-un-uuid'
      );

      expect(reponse.status).toBe(400);
    });
  });

  describe('quand requête POST sur `/api/admin/groupes-entites/associations`', () => {
    it('associe les entités aux groupes', async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        {
          idsGroupes: [groupe.donnees().id],
          sirets: ['11111111100011'],
        }
      );

      expect(reponse.status).toBe(200);
      const [groupeLu] = await testeur
        .depotDonnees()
        .lisGroupesEntitesDe('U1' as UUID);
      expect(groupeLu.donnees().siretsAssocies).toEqual(['11111111100011']);
    });

    it("répond 403 si un des SIRET n'est pas dans le périmètre de l'utilisateur", async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        {
          idsGroupes: [groupe.donnees().id],
          sirets: ['99999999900099'],
        }
      );

      expect(reponse.status).toBe(403);
    });

    it("répond 404 si un des groupes n'appartient pas à l'utilisateur", async () => {
      await declareAdminSur('U2', ['11111111100011']);
      const groupeDeU2 = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U2' as UUID, 'Région Nord');

      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        {
          idsGroupes: [groupeDeU2.donnees().id],
          sirets: ['11111111100011'],
        }
      );

      expect(reponse.status).toBe(404);
    });

    it('refuse une liste de SIRET vide', async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        { idsGroupes: [groupe.donnees().id], sirets: [] }
      );

      expect(reponse.status).toBe(400);
    });

    it('refuse un SIRET mal formé', async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        { idsGroupes: [groupe.donnees().id], sirets: ['pas-un-siret'] }
      );

      expect(reponse.status).toBe(400);
    });

    it('refuse une liste de groupes vide', async () => {
      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        { idsGroupes: [], sirets: ['11111111100011'] }
      );

      expect(reponse.status).toBe(400);
    });

    it('refuse des identifiants de groupe qui ne sont pas des UUID', async () => {
      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        { idsGroupes: ['pas-un-uuid'], sirets: ['11111111100011'] }
      );

      expect(reponse.status).toBe(400);
    });

    it('refuse plus de 1000 SIRET', async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        {
          idsGroupes: [groupe.donnees().id],
          sirets: Array(1001).fill('11111111100011'),
        }
      );

      expect(reponse.status).toBe(400);
    });

    it('refuse plus de 1000 groupes', async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.post(
        '/api/admin/groupes-entites/associations',
        {
          idsGroupes: Array(1001).fill(groupe.donnees().id),
          sirets: ['11111111100011'],
        }
      );

      expect(reponse.status).toBe(400);
    });
  });

  describe('quand requête DELETE sur `/api/admin/groupes-entites/:id/associations`', () => {
    it('dissocie les entités du groupe', async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');
      await testeur
        .depotDonnees()
        .associeEntitesAuxGroupes(
          'U1' as UUID,
          [groupe.donnees().id],
          ['11111111100011', '22222222200022']
        );

      const reponse = await testeur.delete(
        `/api/admin/groupes-entites/${groupe.donnees().id}/associations`,
        { sirets: ['11111111100011'] }
      );

      expect(reponse.status).toBe(200);
      const [groupeLu] = await testeur
        .depotDonnees()
        .lisGroupesEntitesDe('U1' as UUID);
      expect(groupeLu.donnees().siretsAssocies).toEqual(['22222222200022']);
    });

    it("répond 404 si le groupe n'appartient pas à l'utilisateur", async () => {
      await declareAdminSur('U2', ['11111111100011']);
      const groupeDeU2 = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U2' as UUID, 'Région Nord');

      const reponse = await testeur.delete(
        `/api/admin/groupes-entites/${groupeDeU2.donnees().id}/associations`,
        { sirets: ['11111111100011'] }
      );

      expect(reponse.status).toBe(404);
    });

    it("refuse un identifiant de groupe qui n'est pas un UUID", async () => {
      const reponse = await testeur.delete(
        '/api/admin/groupes-entites/pas-un-uuid/associations',
        { sirets: ['11111111100011'] }
      );

      expect(reponse.status).toBe(400);
    });

    it("répond 403 si un des SIRET n'est pas dans le périmètre de l'utilisateur", async () => {
      const groupe = await testeur
        .depotDonnees()
        .nouveauGroupeEntites('U1' as UUID, 'Région Nord');

      const reponse = await testeur.delete(
        `/api/admin/groupes-entites/${groupe.donnees().id}/associations`,
        { sirets: ['99999999900099'] }
      );

      expect(reponse.status).toBe(403);
    });
  });
});
