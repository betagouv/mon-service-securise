import testeurMSS from '../testeurMSS.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { donneesPartagees } from '../../aides/http.js';

describe("Le serveur MSS des pages d'admin", () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  [
    '/admin/entites',
    '/admin/utilisateurs',
    '/admin/administrateurs',
    '/admin/statistiques',
  ].forEach((route) => {
    describe(`quand GET sur ${route}`, () => {
      beforeEach(() => {
        const utilisateur = unUtilisateur().construis();
        testeur.depotDonnees().utilisateur = async () => utilisateur;
        testeur.depotDonnees().estAdmin = async () => true;
        testeur.depotDonnees().estSuperviseur = async () => true;
      });

      it("vérifie que l'utilisateur a accepté les CGU", async () => {
        await testeur
          .middleware()
          .verifieRequeteExigeAcceptationCGU(testeur.app(), `${route}`);
      });

      it('sert le contenu HTML de la page', async () => {
        const reponse = await testeur.get(`${route}`);

        expect(reponse.status).toBe(200);
        expect(reponse.headers['content-type']).toContain('text/html');
      });

      it("jette une erreur 404 si le feature flag de gestion des orgas n'est pas activé", async () => {
        testeur.adaptateurEnvironnement().featureFlag = () => ({
          avecGestionDesOrganisations: () => false,
        });

        const reponse = await testeur.get(`${route}`);

        expect(reponse.status).toBe(404);
      });

      it("jette une erreur 404 si l'utilisateur n'est ni admin ni superviseur", async () => {
        testeur.depotDonnees().estAdmin = async () => false;
        testeur.depotDonnees().estSuperviseur = async () => false;

        const reponse = await testeur.get(`${route}`);

        expect(reponse.status).toBe(404);
      });
    });
  });

  it("ne donne accès à la page admin/utilisateurs qu'aux admins", async () => {
    testeur.depotDonnees().estAdmin = async () => false;
    testeur.depotDonnees().estSuperviseur = async () => true;

    const reponse = await testeur.get('/admin/utilisateurs');

    expect(reponse.status).toBe(404);
  });

  it("ne donne accès à la page admin/administrateurs qu'aux superviseurs", async () => {
    testeur.depotDonnees().estAdmin = async () => true;
    testeur.depotDonnees().estSuperviseur = async () => false;

    const reponse = await testeur.get('/admin/administrateurs');

    expect(reponse.status).to.equal(404);
  });

  describe("concernant l'affichage des groupes d'entités sur /admin/entites", () => {
    beforeEach(() => {
      testeur.depotDonnees().estAdmin = async () => true;
    });

    it('indique à la page de les afficher si le feature flag est activé', async () => {
      const reponse = await testeur.get('/admin/entites');

      const donnees = donneesPartagees(reponse.text, 'donnees-admin-entites');
      expect(donnees.avecGroupesEntites).toBe(true);
    });

    it('indique à la page de ne pas les afficher si le feature flag est désactivé', async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecGestionDesOrganisations: () => true,
        avecGroupesEntites: () => false,
      });

      const reponse = await testeur.get('/admin/entites');

      const donnees = donneesPartagees(reponse.text, 'donnees-admin-entites');
      expect(donnees.avecGroupesEntites).toBe(false);
    });
  });
});
