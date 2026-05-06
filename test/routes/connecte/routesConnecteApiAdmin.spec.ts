import testeurMSS from '../testeurMSS.js';
import Entite, { DonneesEntite } from '../../../src/modeles/entite.ts';
import { UUID } from '../../../src/typesBasiques.ts';

describe('Le serveur MSS des routes /api/admin/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  it("vérifie que l'utilisateur est authentifié sur toutes les routes", async () => {
    // On vérifie une seule route privée.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié aux routes de la visite guidée.
    await testeur
      .middleware()
      .verifieRequeteExigeAcceptationCGU(testeur.app(), {
        method: 'get',
        url: '/api/admin/entites',
      });
  });

  describe('quand requête GET sur `/api/admin/entites`', () => {
    it("retourne la liste des entités dans le périmètre de l'utilisateur courant", async () => {
      let idAdmin;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().entitesDansPerimetreDe = async (
        idUtilisateur: UUID
      ) => {
        idAdmin = idUtilisateur;
        return [
          new Entite({ siret: '123', nom: 'Une entite', departement: '33' }),
        ];
      };

      const reponse = await testeur.get('/api/admin/entites');

      expect(idAdmin).toBe('U1');
      expect(reponse.body).toEqual<DonneesEntite[]>([
        { siret: '123', nom: 'Une entite', departement: '33' },
      ]);
    });
  });
});
