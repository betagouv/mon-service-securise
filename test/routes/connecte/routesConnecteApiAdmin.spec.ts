import testeurMSS from '../testeurMSS.js';
import { DonneesEntite } from '../../../src/modeles/entite.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unUUID } from '../../constructeurs/UUID.ts';
import Superviseur from '../../../src/modeles/superviseur.ts';

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
      testeur.serviceAdministrationOrganisations().entitesDe = async (
        idUtilisateur: UUID
      ) => {
        idAdmin = idUtilisateur;
        return [{ siret: '123', nom: 'Une entite', departement: '33' }];
      };

      const reponse = await testeur.get('/api/admin/entites');

      expect(idAdmin).toBe('U1');
      expect(reponse.body).toEqual<DonneesEntite[]>([
        { siret: '123', nom: 'Une entite', departement: '33' },
      ]);
    });
  });

  describe('quand requête GET sur `/api/admin/utilisateurs`', () => {
    it("retourne la liste des utilisateurs dans le périmètre de l'utilisateur courant", async () => {
      let idAdmin;
      testeur.middleware().reinitialise({ idUtilisateur: 'A1' });
      testeur.serviceAdministrationOrganisations().utilisateursDansLePerimetreDe =
        async (idUtilisateur: UUID) => {
          idAdmin = idUtilisateur;
          return [
            unUtilisateur()
              .avecEmail('jean@dupond.fr')
              .quiSAppelle('Jean Dupond')
              .quiTravaillePour({
                nom: 'Mon entite',
                siret: 'SIRET',
                departement: '75',
              })
              .avecPostes(['RSSI'])
              .avecId('U1')
              .construis(),
          ];
        };

      const reponse = await testeur.get('/api/admin/utilisateurs');

      expect(idAdmin).toBe('A1');
      expect(reponse.body).toHaveLength(1);
      expect(reponse.body).toEqual([
        {
          id: 'U1',
          prenomNom: 'Jean Dupond',
          email: 'jean@dupond.fr',
          entite: {
            nom: 'Mon entite',
            siret: 'SIRET',
            departement: '75',
          },
          postes: ['RSSI'],
        },
      ]);
    });
  });

  describe('quand requête POST sur `/api/admin/nomme`', () => {
    const siret = '13000766900018';
    const idSuperviseur = unUUID('S');

    beforeEach(() => {
      testeur.depotDonnees().lisSuperviseur = () =>
        Superviseur.hydrate({
          idUtilisateur: idSuperviseur,
          entitesSupervisees: [{ siret }],
        });
    });

    it('jette une erreur si les données sont invalides', async () => {
      const { status } = await testeur.post('/api/admin/nomme', {
        emails: [1, 2],
        siret: false,
      });

      expect(status).toBe(400);
    });

    it("jette une erreur si l'utilisateur n'est pas superviseur", async () => {
      testeur.depotDonnees().lisSuperviseur = () => undefined;

      const { status } = await testeur.post('/api/admin/nomme', {
        emails: ['inconnu@mail.fr'],
        siret,
      });

      expect(status).toBe(403);
    });

    it("jette une erreur si le siret n'est pas supervisé par le superviseur", async () => {
      const { status } = await testeur.post('/api/admin/nomme', {
        emails: ['inconnu@mail.fr'],
        siret: '13000766999999',
      });

      expect(status).toBe(403);
    });

    it('ne fait rien pour un utilisateur non existant', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: idSuperviseur });
      testeur.depotDonnees().utilisateurAvecEmail = async () => undefined;
      testeur.serviceAdministrationOrganisations().nommeAdmin = vi.fn();

      const { status } = await testeur.post('/api/admin/nomme', {
        emails: ['inconnu@mail.fr'],
        siret,
      });

      expect(status).toBe(200);
      expect(
        testeur.serviceAdministrationOrganisations().nommeAdmin
      ).not.toHaveBeenCalled();
    });

    it("délègue au service d'administration l'ajout des admins sur le siret", async () => {
      const idAdminA = unUUID('A');
      const idAdminB = unUUID('B');
      const emailA = 'jean.dujardin@beta.gouv.fr';
      const emailB = 'jeanne.dujardin@beta.gouv.fr';
      testeur.middleware().reinitialise({ idUtilisateur: idSuperviseur });
      testeur.depotDonnees().utilisateurAvecEmail = async (e: string) =>
        e === emailA || e === emailB
          ? unUtilisateur()
              .avecId(e === emailA ? idAdminA : idAdminB)
              .avecEmail(e)
              .construis()
          : undefined;
      testeur.serviceAdministrationOrganisations().nommeAdmin = vi.fn();

      const { status } = await testeur.post('/api/admin/nomme', {
        emails: [emailA, emailB],
        siret,
      });

      expect(status).toBe(200);
      expect(
        testeur.serviceAdministrationOrganisations().nommeAdmin
      ).toHaveBeenCalledWith(siret, idAdminA, 'jean.dujardin@beta.gouv.fr');
      expect(
        testeur.serviceAdministrationOrganisations().nommeAdmin
      ).toHaveBeenCalledWith(siret, idAdminB, 'jeanne.dujardin@beta.gouv.fr');
    });

    it('dédoublonne les emails', async () => {
      const idAdmin = unUUID('A');
      const email = 'jean.dujardin@beta.gouv.fr';
      testeur.middleware().reinitialise({ idUtilisateur: idSuperviseur });
      testeur.depotDonnees().utilisateurAvecEmail = async (e: string) =>
        e === email
          ? unUtilisateur().avecId(idAdmin).avecEmail(email).construis()
          : undefined;
      testeur.serviceAdministrationOrganisations().nommeAdmin = vi.fn();

      const { status } = await testeur.post('/api/admin/nomme', {
        emails: [email, email],
        siret,
      });

      expect(status).toBe(200);
      expect(
        testeur.serviceAdministrationOrganisations().nommeAdmin
      ).toHaveBeenCalledTimes(1);
    });
  });
});
