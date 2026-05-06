import testeurMSS from '../testeurMSS.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';

describe("Le serveur MSS des pages d'admin", () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  ['/admin/entites'].forEach((route) => {
    describe(`quand GET sur ${route}`, () => {
      beforeEach(() => {
        const utilisateur = unUtilisateur().construis();
        testeur.depotDonnees().utilisateur = async () => utilisateur;
      });

      it("vérifie que l'utilisateur a accepté les CGU", async () => {
        await testeur
          .middleware()
          .verifieRequeteExigeAcceptationCGU(testeur.app(), `${route}`);
      });

      it('sert le contenu HTML de la page', async () => {
        const reponse = await testeur.get(`${route}`);

        expect(reponse.status).to.equal(200);
        expect(reponse.headers['content-type']).to.contain('text/html');
      });

      it("jette une erreur 404 si le feature flag de gestion des orgas n'est pas activé", async () => {
        testeur.adaptateurEnvironnement().featureFlag = () => ({
          avecGestionDesOrganisations: () => false,
        });

        const reponse = await testeur.get(`${route}`);

        expect(reponse.status).to.equal(404);
      });
    });
  });
});
