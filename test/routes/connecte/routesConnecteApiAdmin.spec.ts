import testeurMSS from '../testeurMSS.js';
import { DonneesEntite } from '../../../src/modeles/entite.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import Superviseur from '../../../src/modeles/superviseur.ts';
import { AdminOrganisations } from '../../../src/modeles/gestionOrganisations/adminOrganisations.ts';
import { UtilisateurAdministre } from '../../../src/modeles/gestionOrganisations/utilisateurAdministre.ts';
import { ErreurSuppressionImpossible } from '../../../src/erreurs.ts';

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
            new UtilisateurAdministre(
              unUUID('U'),
              {
                email: 'jean@dupond.fr',
                prenom: 'Jean',
                nom: 'Dupond',
                postes: ['RSSI'],
              },
              true,
              3,
              6
            ),
          ];
        };

      const reponse = await testeur.get('/api/admin/utilisateurs');

      expect(idAdmin).toBe('A1');
      expect(reponse.body).toHaveLength(1);
      expect(reponse.body).toEqual([
        {
          id: unUUID('U'),
          prenomNom: 'Jean Dupond',
          email: 'jean@dupond.fr',
          postes: 'RSSI',
          estAdmin: true,
          nombreEntites: 3,
          nombreServices: 6,
        },
      ]);
    });
  });

  describe('quand requete POST sur `/api/admin/verifieEmail', () => {
    beforeEach(() => {
      testeur.depotDonnees().lisSuperviseur = async () =>
        Superviseur.nouveau(unUUIDRandom());
    });

    it('applique une protection de trafic', async () => {
      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'post',
        url: '/api/admin/verifieEmail',
      });
    });

    it("renvoie une erreur 403 si l'utilisateur courant n'est pas superviseur", async () => {
      testeur.depotDonnees().lisSuperviseur = async () => undefined;

      const { status } = await testeur.post('/api/admin/verifieEmail', {
        email: 'a@a.fr',
      });

      expect(status).toBe(403);
    });

    it("jette une erreur 400 si l'email est invalide", async () => {
      const { status } = await testeur.post('/api/admin/verifieEmail', {
        email: 'pasUnEmail',
      });
      expect(status).toBe(400);
    });

    it("renvoie l'information de l'existence ou non de l'email", async () => {
      testeur.depotDonnees().utilisateurAvecEmail = async (email: string) => {
        if (email === 'existe@societe.fr') return unUtilisateur().donnees;

        return undefined;
      };

      const oui = await testeur.post('/api/admin/verifieEmail', {
        email: 'existe@societe.fr',
      });
      expect(oui.body).toEqual({ existe: true });

      const non = await testeur.post('/api/admin/verifieEmail', {
        email: 'fantome@societe.fr',
      });
      expect(non.body).toEqual({ existe: false });
    });
  });

  describe('quand requête POST sur `/api/admin/nomme`', () => {
    const siret = '13000766900018';
    const idSuperviseur = unUUID('S');
    const idAdmin = unUUID('A');

    beforeEach(() => {
      testeur.depotDonnees().lisSuperviseur = async () =>
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

    describe('applique les contrôles de permissions', () => {
      beforeEach(() => {
        testeur.depotDonnees().lisSuperviseur = async () => undefined;
        testeur.depotDonnees().lisAdminOrganisations = async () => undefined;
      });

      it("jette une erreur si l'utilisateur n'est ni superviseur, ni admin", async () => {
        const { status } = await testeur.post('/api/admin/nomme', {
          emails: ['utilisateur_lambda@mail.fr'],
          siret,
        });

        expect(status).toBe(403);
      });

      it("jette une erreur si un superviseur veut nommer sur un SIRET qui n'est pas dans son périmètre", async () => {
        testeur.depotDonnees().lisSuperviseur = async () =>
          Superviseur.hydrate({
            idUtilisateur: idSuperviseur,
            entitesSupervisees: [{ siret }],
          });

        const unAutreSiret = '13000766900999';
        const { status } = await testeur.post('/api/admin/nomme', {
          emails: ['futur_admin@mail.fr'],
          siret: unAutreSiret,
        });

        expect(status).toBe(403);
      });

      it("jette une erreur si un admin veut nommer sur un SIRET qui n'est pas dans son périmètre", async () => {
        testeur.depotDonnees().lisAdminOrganisations = async () =>
          AdminOrganisations.hydrate({
            idUtilisateur: idAdmin,
            entitesAdministrees: [{ siret }],
          });

        const unAutreSiret = '13000766900999';
        const { status } = await testeur.post('/api/admin/nomme', {
          emails: ['futur_admin@mail.fr'],
          siret: unAutreSiret,
        });

        expect(status).toBe(403);
      });
    });
  });

  describe('quand requête DELETE sur `/api/admin/:idUtilisateur`', () => {
    const siret = '13000766900018';
    const idSuperviseur = unUUID('S');
    const idAdminASupprimer = unUUIDRandom();

    beforeEach(() => {
      testeur.depotDonnees().lisSuperviseur = async () =>
        Superviseur.hydrate({
          idUtilisateur: idSuperviseur,
          entitesSupervisees: [{ siret }],
        });
    });

    it("délègue au service d'administration le retrait de l'admin sur le siret", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: idSuperviseur });
      testeur.serviceAdministrationOrganisations().retireAdmin = vi.fn();

      const { status } = await testeur.delete('/api/admin', {
        siret,
        idUtilisateur: idAdminASupprimer,
      });

      expect(status).toBe(200);
      expect(
        testeur.serviceAdministrationOrganisations().retireAdmin
      ).toHaveBeenCalledWith(siret, idAdminASupprimer);
    });

    it("jette une erreur 400 si l'id de l'utilisateur n'est pas un UUID valide", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: idSuperviseur });

      const { status } = await testeur.delete('/api/admin', {
        siret,
        idUtilisateur: 'pas-un-uuid',
      });

      expect(status).toBe(400);
    });

    it("jette une erreur 400 si l'utilisateur courant essaie de se supprimer", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: idAdminASupprimer });

      const { status } = await testeur.delete('/api/admin', {
        siret,
        idUtilisateur: idAdminASupprimer,
      });

      expect(status).toBe(400);
    });

    it('jette une erreur 422 si la suppression est impossible', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: idSuperviseur });
      testeur.serviceAdministrationOrganisations().retireAdmin = async () => {
        throw new ErreurSuppressionImpossible();
      };

      const { status } = await testeur.delete('/api/admin', {
        siret,
        idUtilisateur: idAdminASupprimer,
      });

      expect(status).toBe(422);
    });

    describe('applique les contrôles de permissions suivants', () => {
      beforeEach(() => {
        testeur.depotDonnees().lisSuperviseur = async () => undefined;
        testeur.depotDonnees().lisAdminOrganisations = async () => undefined;
      });

      it("jette une erreur si l'utilisateur n'est ni superviseur, ni admin", async () => {
        const { status } = await testeur.delete('/api/admin', {
          siret,
          idUtilisateur: idAdminASupprimer,
        });

        expect(status).toBe(403);
      });

      it("jette une erreur si un superviseur veut retirer un admin sur un SIRET qui n'est pas dans son périmètre", async () => {
        testeur.depotDonnees().lisSuperviseur = async () =>
          Superviseur.hydrate({
            idUtilisateur: idSuperviseur,
            entitesSupervisees: [{ siret }],
          });

        const unAutreSiret = '13000766900999';
        const { status } = await testeur.delete('/api/admin', {
          siret: unAutreSiret,
          idUtilisateur: idAdminASupprimer,
        });

        expect(status).toBe(403);
      });

      it("jette une erreur si un admin veut retirer un admin sur un SIRET qui n'est pas dans son périmètre", async () => {
        testeur.depotDonnees().lisAdminOrganisations = async () =>
          AdminOrganisations.hydrate({
            idUtilisateur: idSuperviseur,
            entitesAdministrees: [{ siret }],
          });

        const unAutreSiret = '13000766900999';
        const { status } = await testeur.delete('/api/admin', {
          siret: unAutreSiret,
          idUtilisateur: idAdminASupprimer,
        });

        expect(status).toBe(403);
      });
    });
  });
});
