import testeurMSS from '../testeurMSS.js';

describe('Le serveur MSS des routes privées /api/groupes-services', () => {
  const testeur = testeurMSS();

  beforeEach(async () => {
    await testeur.initialise();
    testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
  });

  describe('quand requête GET sur `/api/groupes-services`', () => {
    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'get',
          url: '/api/groupes-services',
        });
    });

    it('répond 404 si le feature flag est désactivé', async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecGroupesServices: () => false,
      });

      const reponse = await testeur.get('/api/groupes-services');

      expect(reponse.status).toBe(404);
    });

    it("renvoie une liste vide si l'utilisateur n'a aucun groupe", async () => {
      const reponse = await testeur.get('/api/groupes-services');

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual([]);
    });

    it("renvoie uniquement les groupes de l'utilisateur courant", async () => {
      const groupe = await testeur.depotDonnees().nouveauGroupe('U1', 'Métier');
      await testeur.depotDonnees().nouveauGroupe('U2', 'Support');

      const reponse = await testeur.get('/api/groupes-services');

      expect(reponse.body).toEqual([
        { id: groupe.donnees().id, libelle: 'Métier' },
      ]);
    });
  });

  describe('quand requête POST sur `/api/groupes-services`', () => {
    it("crée le groupe pour l'utilisateur courant et le renvoie", async () => {
      const reponse = await testeur.post('/api/groupes-services', {
        libelle: 'Métier',
      });

      expect(reponse.status).toBe(201);
      const [groupe] = await testeur.depotDonnees().lisGroupesDe('U1');
      expect(reponse.body).toEqual({
        id: groupe.donnees().id,
        libelle: 'Métier',
      });
    });

    it('refuse un libellé vide', async () => {
      const reponse = await testeur.post('/api/groupes-services', {
        libelle: '   ',
      });

      expect(reponse.status).toBe(400);
    });

    it('refuse un libellé de plus de 200 caractères', async () => {
      const reponse = await testeur.post('/api/groupes-services', {
        libelle: 'a'.repeat(201),
      });

      expect(reponse.status).toBe(400);
    });

    it("répond 422 si l'utilisateur a déjà un groupe avec ce libellé", async () => {
      await testeur.depotDonnees().nouveauGroupe('U1', 'Métier');

      const reponse = await testeur.post('/api/groupes-services', {
        libelle: 'Métier',
      });

      expect(reponse.status).toBe(422);
      expect(reponse.body).toEqual({
        erreur: { code: 'LIBELLE_GROUPE_DEJA_EXISTANT' },
      });
    });
  });

  describe('quand requête PUT sur `/api/groupes-services/:id`', () => {
    it("refuse un identifiant qui n'est pas un UUID", async () => {
      const reponse = await testeur.put('/api/groupes-services/PAS_UN_UUID', {
        libelle: 'Support',
      });

      expect(reponse.status).toBe(400);
    });

    it('refuse un libellé vide', async () => {
      const groupe = await testeur.depotDonnees().nouveauGroupe('U1', 'Métier');

      const reponse = await testeur.put(
        `/api/groupes-services/${groupe.donnees().id}`,
        { libelle: '   ' }
      );

      expect(reponse.status).toBe(400);
    });

    it("renomme le groupe de l'utilisateur courant", async () => {
      const groupe = await testeur.depotDonnees().nouveauGroupe('U1', 'Métier');

      const reponse = await testeur.put(
        `/api/groupes-services/${groupe.donnees().id}`,
        { libelle: 'Support' }
      );

      expect(reponse.status).toBe(200);
      const [groupeLu] = await testeur.depotDonnees().lisGroupesDe('U1');
      expect(groupeLu.donnees().libelle).toBe('Support');
    });

    it("répond 404 et ne renomme pas le groupe d'un autre utilisateur", async () => {
      const groupe = await testeur.depotDonnees().nouveauGroupe('U2', 'Métier');

      const reponse = await testeur.put(
        `/api/groupes-services/${groupe.donnees().id}`,
        { libelle: 'Support' }
      );

      expect(reponse.status).toBe(404);
      const [groupeLu] = await testeur.depotDonnees().lisGroupesDe('U2');
      expect(groupeLu.donnees().libelle).toBe('Métier');
    });

    it("répond 422 si l'utilisateur a déjà un autre groupe avec ce libellé", async () => {
      await testeur.depotDonnees().nouveauGroupe('U1', 'Métier');
      const support = await testeur
        .depotDonnees()
        .nouveauGroupe('U1', 'Support');

      const reponse = await testeur.put(
        `/api/groupes-services/${support.donnees().id}`,
        { libelle: 'Métier' }
      );

      expect(reponse.status).toBe(422);
      expect(reponse.body).toEqual({
        erreur: { code: 'LIBELLE_GROUPE_DEJA_EXISTANT' },
      });
    });
  });

  describe('quand requête DELETE sur `/api/groupes-services/:id`', () => {
    it("refuse un identifiant qui n'est pas un UUID", async () => {
      const reponse = await testeur.delete('/api/groupes-services/PAS_UN_UUID');

      expect(reponse.status).toBe(400);
    });

    it("supprime le groupe de l'utilisateur courant", async () => {
      const groupe = await testeur.depotDonnees().nouveauGroupe('U1', 'Métier');

      const reponse = await testeur.delete(
        `/api/groupes-services/${groupe.donnees().id}`
      );

      expect(reponse.status).toBe(200);
      expect(await testeur.depotDonnees().lisGroupesDe('U1')).toEqual([]);
    });

    it("répond 404 et ne supprime pas le groupe d'un autre utilisateur", async () => {
      const groupe = await testeur.depotDonnees().nouveauGroupe('U2', 'Métier');

      const reponse = await testeur.delete(
        `/api/groupes-services/${groupe.donnees().id}`
      );

      expect(reponse.status).toBe(404);
      expect(await testeur.depotDonnees().lisGroupesDe('U2')).toHaveLength(1);
    });
  });
});
