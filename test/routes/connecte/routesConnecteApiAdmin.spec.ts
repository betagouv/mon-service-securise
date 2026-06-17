import testeurMSS from '../testeurMSS.js';
import { UUID } from '../../../src/typesBasiques.ts';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import Superviseur from '../../../src/modeles/superviseur.ts';
import { UtilisateurAdministre } from '../../../src/modeles/gestionOrganisations/utilisateurAdministre.ts';
import {
  EchecAutorisation,
  ErreurEntiteNonAdministre,
  ErreurServiceNonAdministre,
  ErreurSuppressionImpossible,
  ErreurUtilisateurNonAdministre,
} from '../../../src/erreurs.ts';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  Autorisation,
  DonneesAutorisation,
} from '../../../src/modeles/autorisations/autorisation.ts';

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
        return [
          {
            siret: '123',
            nom: 'Une entite',
            nombreServices: 2,
            nombreUtilisateurs: 4,
            administrateurs: [{ id: 'U1' }, { id: 'U2' }],
          },
        ];
      };

      const reponse = await testeur.get('/api/admin/entites');

      expect(idAdmin).toBe('U1');
      expect(reponse.body).toEqual([
        {
          siret: '123',
          nom: 'Une entite',
          nombreServices: 2,
          nombreUtilisateurs: 4,
          administrateurs: [
            { id: 'U1', estUtilisateurCourant: true },
            { id: 'U2', estUtilisateurCourant: false },
          ],
        },
      ]);
    });
  });

  describe('quand requête GET sur `/api/admin/utilisateurs`', () => {
    it("retourne la liste des utilisateurs dans le périmètre de l'utilisateur courant", async () => {
      let idAdmin;
      const idService = unUUIDRandom();
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
              [
                uneAutorisation().deProprietaire(unUUID('U'), idService)
                  .donnees as DonneesAutorisation,
              ]
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
          autorisations: [{ idService, role: 'PROPRIETAIRE' }],
        },
      ]);
    });
  });

  describe('quand requête POST sur `/api/admin/utilisateurs/:idUtilisateur/roles`', () => {
    const idAdmin = unUUIDRandom();
    const idUtilisateurAdministre = unUUIDRandom();
    const idService = unUUIDRandom();

    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: idAdmin });
    });

    it('jette une erreur si la payload est invalide', async () => {
      const reponse = await testeur.post(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { role: 'QUINEXISTEPAS', idsServices: false }
      );

      expect(reponse.status).toBe(400);
    });

    it("jette une erreur si l'id utilisateur est invalide", async () => {
      const reponse = await testeur.post(
        `/api/admin/utilisateurs/pas-un-uuid/roles`,
        { role: 'PROPRIETAIRE', idsServices: [idService] }
      );

      expect(reponse.status).toBe(400);
    });

    it("jette une erreur si l'utilisateur ne fait pas partie du périmètre de l'admin", async () => {
      testeur.serviceAdministrationOrganisations().attribueRoleAUtilisateurAdministre =
        async () => {
          throw new ErreurUtilisateurNonAdministre();
        };

      const reponse = await testeur.post(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { role: 'PROPRIETAIRE', idsServices: [idService] }
      );

      expect(reponse.status).toBe(403);
    });

    it("jette une erreur si le service ne fait pas partie du périmètre de l'admin", async () => {
      testeur.serviceAdministrationOrganisations().attribueRoleAUtilisateurAdministre =
        async () => {
          throw new ErreurServiceNonAdministre();
        };

      const reponse = await testeur.post(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { role: 'PROPRIETAIRE', idsServices: [idService] }
      );

      expect(reponse.status).toBe(403);
    });

    it('jette une erreur si la mise à jour du rôle a échoué', async () => {
      testeur.serviceAdministrationOrganisations().attribueRoleAUtilisateurAdministre =
        async () => {
          throw new EchecAutorisation();
        };

      const reponse = await testeur.post(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { role: 'PROPRIETAIRE', idsServices: [idService] }
      );

      expect(reponse.status).toBe(422);
    });

    it("délègue au service l'attribution du rôle", async () => {
      testeur.serviceAdministrationOrganisations().attribueRoleAUtilisateurAdministre =
        vi.fn();

      await testeur.post(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { role: 'PROPRIETAIRE', idsServices: [idService] }
      );

      expect(
        testeur.serviceAdministrationOrganisations()
          .attribueRoleAUtilisateurAdministre
      ).toHaveBeenCalledWith(
        idAdmin,
        idUtilisateurAdministre,
        Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        [idService]
      );
    });
  });

  describe('quand requête DELETE sur `/api/admin/utilisateurs/:idUtilisateur/roles`', () => {
    const idAdmin = unUUIDRandom();
    const idUtilisateurAdministre = unUUIDRandom();
    const idService = unUUIDRandom();

    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: idAdmin });
    });

    it('jette une erreur si la payload est invalide', async () => {
      const reponse = await testeur.delete(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { idsServices: false }
      );

      expect(reponse.status).toBe(400);
    });

    it("jette une erreur si l'id utilisateur est invalide", async () => {
      const reponse = await testeur.delete(
        `/api/admin/utilisateurs/pas-un-uuid/roles`,
        { idsServices: [idService] }
      );

      expect(reponse.status).toBe(400);
    });

    it("jette une erreur si l'utilisateur ne fait pas partie du périmètre de l'admin", async () => {
      testeur.serviceAdministrationOrganisations().retireAccesUtilisateurAdministre =
        async () => {
          throw new ErreurUtilisateurNonAdministre();
        };

      const reponse = await testeur.delete(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { idsServices: [idService] }
      );

      expect(reponse.status).toBe(403);
    });

    it("jette une erreur si le service ne fait pas partie du périmètre de l'admin", async () => {
      testeur.serviceAdministrationOrganisations().retireAccesUtilisateurAdministre =
        async () => {
          throw new ErreurServiceNonAdministre();
        };

      const reponse = await testeur.delete(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { idsServices: [idService] }
      );

      expect(reponse.status).toBe(403);
    });

    it('jette une erreur si la mise à jour du rôle a échoué', async () => {
      testeur.serviceAdministrationOrganisations().retireAccesUtilisateurAdministre =
        async () => {
          throw new EchecAutorisation();
        };

      const reponse = await testeur.delete(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { idsServices: [idService] }
      );

      expect(reponse.status).toBe(422);
    });

    it('délègue au service le retrait des accès', async () => {
      testeur.serviceAdministrationOrganisations().retireAccesUtilisateurAdministre =
        vi.fn();

      await testeur.delete(
        `/api/admin/utilisateurs/${idUtilisateurAdministre}/roles`,
        { idsServices: [idService] }
      );

      expect(
        testeur.serviceAdministrationOrganisations()
          .retireAccesUtilisateurAdministre
      ).toHaveBeenCalledWith(idAdmin, idUtilisateurAdministre, [idService]);
    });
  });

  describe('quand requête PUT sur `/api/admin/utilisateurs/:idUtilisateur/perimetre`', () => {
    const idActeurAdmin = unUUIDRandom();
    const idAdminModifie = unUUIDRandom();

    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: idActeurAdmin });
    });

    it('jette une erreur si la payload est invalide', async () => {
      const reponse = await testeur.put(
        `/api/admin/utilisateurs/${idAdminModifie}/perimetre`,
        { siretsAAjouter: false, siretsARetirer: 'hello' }
      );

      expect(reponse.status).toBe(400);
    });

    it("jette une erreur si l'id utilisateur est invalide", async () => {
      const reponse = await testeur.put(
        `/api/admin/utilisateurs/pas-un-uuid/perimetre`,
        { siretsAAjouter: [], siretsARetirer: [] }
      );

      expect(reponse.status).toBe(400);
    });

    it("jette une erreur si le périmètre demandé n'est pas entièrement administré", async () => {
      testeur.serviceAdministrationOrganisations().assignePerimetre =
        async () => {
          throw new ErreurEntiteNonAdministre();
        };

      const reponse = await testeur.put(
        `/api/admin/utilisateurs/${idAdminModifie}/perimetre`,
        { siretsAAjouter: ['13000766900999'], siretsARetirer: [] }
      );

      expect(reponse.status).toBe(403);
    });

    it('jette une erreur si la suppression est impossible', async () => {
      testeur.serviceAdministrationOrganisations().assignePerimetre =
        async () => {
          throw new ErreurSuppressionImpossible();
        };

      const reponse = await testeur.put(
        `/api/admin/utilisateurs/${idAdminModifie}/perimetre`,
        { siretsAAjouter: [], siretsARetirer: ['13000766900999'] }
      );

      expect(reponse.status).toBe(422);
    });

    it("délègue au service l'assignation du périmètre", async () => {
      testeur.serviceAdministrationOrganisations().assignePerimetre = vi.fn();

      await testeur.put(`/api/admin/utilisateurs/${idAdminModifie}/perimetre`, {
        siretsAAjouter: ['13000766900999'],
        siretsARetirer: ['13000766900998'],
      });

      expect(
        testeur.serviceAdministrationOrganisations().assignePerimetre
      ).toHaveBeenCalledWith(
        idActeurAdmin,
        idAdminModifie,
        ['13000766900999'],
        ['13000766900998']
      );
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
      testeur.depotDonnees().utilisateurAvecEmail = async () =>
        unUtilisateur().construis();
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
      ).toHaveBeenCalledWith(idSuperviseur, siret, idAdminA);
      expect(
        testeur.serviceAdministrationOrganisations().nommeAdmin
      ).toHaveBeenCalledWith(idSuperviseur, siret, idAdminB);
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

    it("jette une erreur si l'entité n'est pas supervisée", async () => {
      testeur.serviceAdministrationOrganisations().nommeAdmin = async () => {
        throw new ErreurEntiteNonAdministre();
      };

      const { status } = await testeur.post('/api/admin/nomme', {
        emails: ['utilisateur_lambda@mail.fr'],
        siret,
      });

      expect(status).toBe(403);
    });

    it("jette une erreur si l'utilisateur essaye de se nommer soi-même", async () => {
      testeur.serviceAdministrationOrganisations().nommeAdmin = async () => {
        throw new EchecAutorisation();
      };

      const { status } = await testeur.post('/api/admin/nomme', {
        emails: ['utilisateur_lambda@mail.fr'],
        siret,
      });

      expect(status).toBe(400);
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
      ).toHaveBeenCalledWith(idSuperviseur, siret, idAdminASupprimer);
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
      testeur.serviceAdministrationOrganisations().retireAdmin = async () => {
        throw new EchecAutorisation();
      };

      const { status } = await testeur.delete('/api/admin', {
        siret,
        idUtilisateur: idAdminASupprimer,
      });

      expect(status).toBe(400);
    });

    it("jette une erreur 403 si l'entité n'est pas administrée", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: idSuperviseur });
      testeur.serviceAdministrationOrganisations().retireAdmin = async () => {
        throw new ErreurEntiteNonAdministre();
      };

      const { status } = await testeur.delete('/api/admin', {
        siret,
        idUtilisateur: idAdminASupprimer,
      });

      expect(status).toBe(403);
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
  });
});
