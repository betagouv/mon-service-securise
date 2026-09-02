import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import 'tsx/esm'; // Pour que `knex.migrate.latest()` s'exécute dans un écosytème où il comprend typescript. Car dans les tests, `tsc` ne s'exécute jamais.
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import { AdaptateurPostgresTS } from '../../src/adaptateurs/adaptateurPostgresTS.ts';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface.js';
import { DonneesNotificationTransactionnelle } from '../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';

describe("L'adaptateur persistance Postgres", () => {
  let knex: Knex.Knex;
  let trx: Knex.Knex.Transaction;
  let persistance: PersistanceTS;
  const chiffrement = unAdaptateurChiffrementQuiWrap();

  beforeAll(async () => {
    knex = Knex({ client: ClientPgLite, dialect: 'postgres', connection: {} });
    await knex.migrate.latest();
  });

  beforeEach(async () => {
    trx = await knex.transaction();
    persistance = new AdaptateurPostgresTS({ knex: trx, chiffrement });
  });

  afterEach(async () => {
    await trx.rollback();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe("sur demande de lecture d'un admin d'organisations", () => {
    it("retourne `undefined` s'il n'existe pas", async () => {
      const admin = await persistance.lisAdminOrganisations(unUUIDRandom());

      expect(admin).toBeUndefined();
    });

    it("peut lire un admin d'organisations chiffré", async () => {
      const idAdmin = unUUIDRandom();
      const donneesEntite = { nom: 'nom', siret: 'siret', departement: '75' };
      await trx.table('admins_organisations').insert({
        id_utilisateur: idAdmin,
        siret_hash: 'SIRET-HACHÉ',
        donnees: await chiffrement.chiffre(donneesEntite),
      });

      const admin = await persistance.lisAdminOrganisations(idAdmin);

      expect(admin).toEqual({
        idUtilisateur: idAdmin,
        entitesAdministrees: [donneesEntite],
      });
    });
  });

  describe("sur demande de lecture des superviseurs d'une organisation", () => {
    it("retourne une liste vide s'il n'en existe pas", async () => {
      const superviseurs =
        await persistance.lisSuperviseursOrganisation('siret-inconnu');

      expect(superviseurs).toEqual([]);
    });

    it('peut lire des superviseurs chiffrés', async () => {
      const idSuperviseur1 = unUUIDRandom();
      const idSuperviseur2 = unUUIDRandom();
      const entite1 = { nom: 'nom', siret: 'SIRET', departement: '75' };
      const entite2 = { nom: 'nom2', siret: 'SIRET2', departement: '75' };
      const siretHash = chiffrement.hacheSha256('SIRET');
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur1,
        siret_hash: siretHash,
        donnees: await chiffrement.chiffre(entite1),
      });
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur2,
        siret_hash: siretHash,
        donnees: await chiffrement.chiffre(entite1),
      });
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur2,
        siret_hash: chiffrement.hacheSha256('SIRET2'),
        donnees: await chiffrement.chiffre(entite2),
      });

      const superviseurs =
        await persistance.lisSuperviseursOrganisation('SIRET');

      const s1 = superviseurs.find((s) => s.idUtilisateur === idSuperviseur1);
      const s2 = superviseurs.find((s) => s.idUtilisateur === idSuperviseur2);
      expect(superviseurs).toHaveLength(2);
      expect(s1).toEqual({
        idUtilisateur: idSuperviseur1,
        entitesSupervisees: [entite1],
      });
      expect(s2).toEqual({
        idUtilisateur: idSuperviseur2,
        entitesSupervisees: [entite1, entite2],
      });
    });
  });

  describe('sur demande de lecture des admins de plusieurs organisations', () => {
    const entiteA = { nom: 'entiteA', siret: 'SIRET-A', departement: '75' };
    const entiteB = { nom: 'entiteB', siret: 'SIRET-B', departement: '44' };

    const ajouteAdminSur = async (idAdmin: string, entite: typeof entiteA) => {
      await trx.table('admins_organisations').insert({
        id_utilisateur: idAdmin,
        siret_hash: chiffrement.hacheSha256(entite.siret),
        donnees: await chiffrement.chiffre(entite),
      });
    };

    it('associe à chaque SIRET demandé ses admins', async () => {
      const idAdmin1 = unUUIDRandom();
      const idAdmin2 = unUUIDRandom();
      await ajouteAdminSur(idAdmin1, entiteA);
      await ajouteAdminSur(idAdmin2, entiteB);

      const parSiret = await persistance.lisAdminsOrganisations([
        'SIRET-A',
        'SIRET-B',
      ]);

      expect(parSiret.get('SIRET-A')).toEqual([
        { idUtilisateur: idAdmin1, entitesAdministrees: [entiteA] },
      ]);
      expect(parSiret.get('SIRET-B')).toEqual([
        { idUtilisateur: idAdmin2, entitesAdministrees: [entiteB] },
      ]);
    });

    it("donne tout le périmètre d'un admin, pas seulement les SIRET demandés", async () => {
      const idAdmin = unUUIDRandom();
      await ajouteAdminSur(idAdmin, entiteA);
      await ajouteAdminSur(idAdmin, entiteB);

      const parSiret = await persistance.lisAdminsOrganisations(['SIRET-A']);

      expect(parSiret.get('SIRET-A')![0].entitesAdministrees).toEqual([
        entiteA,
        entiteB,
      ]);
    });

    it('associe une liste vide à un SIRET sans admin', async () => {
      const parSiret = await persistance.lisAdminsOrganisations([
        'SIRET-INCONNU',
      ]);

      expect(parSiret.get('SIRET-INCONNU')).toEqual([]);
    });

    it('ne lit rien si aucun SIRET est demandé', async () => {
      const idAdmin = unUUIDRandom();
      await ajouteAdminSur(idAdmin, entiteA);

      const parSiret = await persistance.lisAdminsOrganisations([]);

      expect(parSiret.size).toBe(0);
    });

    it('associe à un même SIRET tous ses admins', async () => {
      const idAdmin1 = unUUIDRandom();
      const idAdmin2 = unUUIDRandom();
      await ajouteAdminSur(idAdmin1, entiteA);
      await ajouteAdminSur(idAdmin2, entiteA);
      await ajouteAdminSur(idAdmin2, entiteB);

      const parSiret = await persistance.lisAdminsOrganisations(['SIRET-A']);

      expect(parSiret.get('SIRET-A')).toEqual([
        { idUtilisateur: idAdmin1, entitesAdministrees: [entiteA] },
        { idUtilisateur: idAdmin2, entitesAdministrees: [entiteA, entiteB] },
      ]);
    });
  });

  describe("sur demande de lecture d'un superviseur", () => {
    it("retourne `undefined` s'il n'existe pas", async () => {
      const superviseur = await persistance.lisSuperviseur(unUUIDRandom());

      expect(superviseur).toBeUndefined();
    });

    it('peut lire un superviseur chiffré', async () => {
      const idSuperviseur = unUUIDRandom();
      const donneesEntite = { nom: 'nom', siret: 'siret', departement: '75' };
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur,
        siret_hash: chiffrement.hacheSha256('siret'),
        donnees: await chiffrement.chiffre(donneesEntite),
      });

      const superviseur = await persistance.lisSuperviseur(idSuperviseur);

      expect(superviseur).toEqual({
        idUtilisateur: idSuperviseur,
        entitesSupervisees: [donneesEntite],
      });
    });

    it('peut lire un superviseur avec plusieurs entités chiffrées', async () => {
      const idSuperviseur = unUUIDRandom();
      const entiteA = { nom: 'entiteA', siret: 'siretA', departement: '75' };
      const entiteB = { nom: 'entiteB', siret: 'siretB', departement: '44' };
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur,
        siret_hash: chiffrement.hacheSha256('siretA'),
        donnees: await chiffrement.chiffre(entiteA),
      });
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur,
        siret_hash: chiffrement.hacheSha256('siretB'),
        donnees: await chiffrement.chiffre(entiteB),
      });

      const superviseur = await persistance.lisSuperviseur(idSuperviseur);

      expect(superviseur).toEqual({
        idUtilisateur: idSuperviseur,
        entitesSupervisees: [entiteA, entiteB],
      });
    });
  });

  describe("sur demande de suppression d'un superviseur", () => {
    it('supprime toutes les lignes du superviseur', async () => {
      const idSuperviseur = unUUIDRandom();
      const donneesEntite = { siret: 'siret', nom: 'nom', departement: '75' };
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur,
        siret_hash: chiffrement.hacheSha256('siret'),
        donnees: await chiffrement.chiffre(donneesEntite),
      });

      await persistance.supprimeSuperviseur(idSuperviseur);

      const superviseur = await persistance.lisSuperviseur(idSuperviseur);
      expect(superviseur).toBeUndefined();
    });
  });

  describe("sur demande de mise à jour d'un superviseur", () => {
    it("ajoute le nouveau superviseur s'il n'existe pas", async () => {
      const idSuperviseur = unUUIDRandom();
      const donneesEntite = { siret: 'siret', nom: 'nom', departement: '75' };

      await persistance.sauvegardeSuperviseur({
        idUtilisateur: idSuperviseur,
        entitesSupervisees: [donneesEntite],
      });

      const superviseurSauvegarde =
        await persistance.lisSuperviseur(idSuperviseur);
      expect(superviseurSauvegarde).toEqual({
        idUtilisateur: idSuperviseur,
        entitesSupervisees: [donneesEntite],
      });
    });

    it("met à jour les entités du superviseur s'il existe", async () => {
      const idSuperviseur = unUUIDRandom();
      const entiteA = { siret: 'siretA', nom: 'nomA', departement: '75' };
      const entiteB = { siret: 'siretB', nom: 'nomB', departement: '75' };
      const entiteC = { siret: 'siretC', nom: 'nomC', departement: '75' };
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur,
        siret_hash: chiffrement.hacheSha256('siretA'),
        donnees: await chiffrement.chiffre(entiteA),
      });
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur,
        siret_hash: chiffrement.hacheSha256('siretB'),
        donnees: await chiffrement.chiffre(entiteB),
      });

      await persistance.sauvegardeSuperviseur({
        idUtilisateur: idSuperviseur,
        entitesSupervisees: [entiteB, entiteC],
      });

      const superviseur = await persistance.lisSuperviseur(idSuperviseur);
      expect(superviseur).toEqual({
        idUtilisateur: idSuperviseur,
        entitesSupervisees: [entiteB, entiteC],
      });
    });
    it("supprime le superviseur s'il n'a plus d'entité supervisée", async () => {
      const idSuperviseur = unUUIDRandom();
      const entiteA = { siret: 'siretA', nom: 'nomA', departement: '75' };
      await trx.table('superviseurs').insert({
        id_superviseur: idSuperviseur,
        siret_hash: chiffrement.hacheSha256('siretA'),
        donnees: await chiffrement.chiffre(entiteA),
      });

      await persistance.sauvegardeSuperviseur({
        idUtilisateur: idSuperviseur,
        entitesSupervisees: [],
      });

      const superviseur = await persistance.lisSuperviseur(idSuperviseur);
      expect(superviseur).toBeUndefined();
    });
  });

  describe("sur demande de mise à jour d'un admin d'organisations", () => {
    it("ajoute le nouvel admin s'il n'existe pas", async () => {
      const idAdmin = unUUIDRandom();
      const donneesEntite = { siret: 'siret' };

      await persistance.sauvegardeAdminOrganisations({
        idUtilisateur: idAdmin,
        entitesAdministrees: [donneesEntite],
      });

      const adminSauvegarde = await persistance.lisAdminOrganisations(idAdmin);
      expect(adminSauvegarde).toEqual({
        idUtilisateur: idAdmin,
        entitesAdministrees: [donneesEntite],
      });
    });

    it("mets à jour les entités de l'admin s'il existe", async () => {
      const idAdmin = unUUIDRandom();
      const donneesEntiteA = {
        nom: 'nomA',
        siret: 'siretA',
        departement: '75',
      };
      const donneesEntiteB = {
        nom: 'nomB',
        siret: 'siretB',
        departement: '75',
      };
      const donneesEntiteC = {
        nom: 'nomC',
        siret: 'siretC',
        departement: '75',
      };
      await trx.table('admins_organisations').insert({
        id_utilisateur: idAdmin,
        siret_hash: chiffrement.hacheSha256('siretA'),
        donnees: await chiffrement.chiffre(donneesEntiteA),
      });
      await trx.table('admins_organisations').insert({
        id_utilisateur: idAdmin,
        siret_hash: chiffrement.hacheSha256('siretB'),
        donnees: await chiffrement.chiffre(donneesEntiteB),
      });

      await persistance.sauvegardeAdminOrganisations({
        idUtilisateur: idAdmin,
        entitesAdministrees: [donneesEntiteB, donneesEntiteC],
      });

      const admin = await persistance.lisAdminOrganisations(idAdmin);
      expect(admin).toEqual({
        idUtilisateur: idAdmin,
        entitesAdministrees: [donneesEntiteB, donneesEntiteC],
      });
    });

    it("supprime l'admin s'il n'a plus d'entités administrées", async () => {
      const idAdmin = unUUIDRandom();
      const donneesEntite = { siret: 'siret' };
      await persistance.sauvegardeAdminOrganisations({
        idUtilisateur: idAdmin,
        entitesAdministrees: [donneesEntite],
      });

      await persistance.sauvegardeAdminOrganisations({
        idUtilisateur: idAdmin,
        entitesAdministrees: [],
      });

      const adminSauvegarde = await persistance.lisAdminOrganisations(idAdmin);
      expect(adminSauvegarde).toBeUndefined();
    });

    it('ne supprime pas les autres admins', async () => {
      const idAdmin1 = unUUIDRandom();
      const idAdmin2 = unUUIDRandom();
      const donneesEntite1 = { siret: 'siret-1' };
      const donneesEntite2 = { siret: 'siret-2' };
      await persistance.sauvegardeAdminOrganisations({
        idUtilisateur: idAdmin1,
        entitesAdministrees: [donneesEntite1],
      });

      await persistance.sauvegardeAdminOrganisations({
        idUtilisateur: idAdmin2,
        entitesAdministrees: [donneesEntite2],
      });

      const adminSauvegarde = await persistance.lisAdminOrganisations(idAdmin1);
      expect(adminSauvegarde).toBeDefined();
    });
  });

  describe("sur demande de lecture des notifications d'un utilisateur", () => {
    it('retourne uniquement les notifications de cet utilisateur', async () => {
      const idUtilisateur = unUUIDRandom();
      const id = unUUIDRandom();
      const idActeur = unUUIDRandom();
      const date = new Date();
      await trx.table('notifications_transactionnelles').insert({
        id,
        lue: false,
        id_acteur: idActeur,
        id_destinataire: idUtilisateur,
        metadonnees: { proprietes: 42 },
        type: 'mentionDansMesure',
        date,
      });
      await trx.table('notifications_transactionnelles').insert({
        id: unUUIDRandom(),
        lue: false,
        id_acteur: unUUIDRandom(),
        id_destinataire: unUUIDRandom(),
        metadonnees: { proprietes: 42 },
        type: 'mentionDansMesure',
        date: new Date(),
      });

      const notifications = await persistance.lisNotificationsDe(idUtilisateur);

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        id,
        lue: false,
        idActeur,
        idDestinataire: idUtilisateur,
        metadonnees: { proprietes: 42 },
        type: 'mentionDansMesure',
        date,
      });
    });
  });

  describe("sur demande de sauvegarde d'une notification", () => {
    it('persiste la notification', async () => {
      const idUtilisateur = unUUIDRandom();
      const donnees: DonneesNotificationTransactionnelle = {
        id: unUUIDRandom(),
        lue: true,
        idActeur: unUUIDRandom(),
        idDestinataire: idUtilisateur,
        metadonnees: { proprietes: 42 },
        type: 'mentionDansMesure',
        date: new Date(),
      };

      await persistance.sauvegardeNotificationTransactionnelle(donnees);

      const notifications = await persistance.lisNotificationsDe(idUtilisateur);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual(donnees);
    });

    it('met à jour une notification existante', async () => {
      const idUtilisateur = unUUIDRandom();
      const idNotification = unUUIDRandom();
      const donnees: DonneesNotificationTransactionnelle = {
        id: idNotification,
        lue: false,
        idActeur: unUUIDRandom(),
        idDestinataire: idUtilisateur,
        metadonnees: { proprietes: 42 },
        type: 'mentionDansMesure',
        date: new Date(),
      };
      await persistance.sauvegardeNotificationTransactionnelle(donnees);

      await persistance.sauvegardeNotificationTransactionnelle({
        ...donnees,
        lue: true,
      });

      const notifications = await persistance.lisNotificationsDe(idUtilisateur);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].lue).toBeTruthy();
    });
  });

  describe("sur demande de suppression d'une notification", () => {
    it('la supprime', async () => {
      const id = unUUIDRandom();
      const idDestinataire = unUUIDRandom();
      await trx.table('notifications_transactionnelles').insert({
        id,
        lue: false,
        id_acteur: unUUIDRandom(),
        id_destinataire: idDestinataire,
        metadonnees: { proprietes: 42 },
        type: 'mentionDansMesure',
        date: new Date(),
      });

      await persistance.supprimeNotificationTransactionnelle(id);

      const notifications =
        await persistance.lisNotificationsDe(idDestinataire);
      expect(notifications).toHaveLength(0);
    });
  });

  describe('sur demande de lecture du rapport de notifications', () => {
    const insereUneNotification = async (
      donnees: Partial<DonneesNotificationTransactionnelle>
    ) => {
      await trx.table('notifications_transactionnelles').insert({
        id: donnees.id ?? unUUIDRandom(),
        lue: donnees.lue ?? false,
        id_acteur: donnees.idActeur ?? unUUIDRandom(),
        id_destinataire: donnees.idDestinataire ?? unUUIDRandom(),
        metadonnees: donnees.metadonnees ?? { proprietes: 42 },
        type: donnees.type ?? 'mentionDansMesure',
        date: donnees.date ?? new Date(),
      });
    };

    it('ne considère que les notifications datant des 7 derniers jours', async () => {
      const idDestinataire = unUUIDRandom();
      const date = new Date();
      const ilYA30Jours = new Date();
      ilYA30Jours.setDate(ilYA30Jours.getDate() - 30);

      await insereUneNotification({
        idDestinataire,
        date,
      });
      await insereUneNotification({
        idDestinataire,
        date: ilYA30Jours,
      });

      const notifications = await persistance.lisRapportNotifications();

      expect(notifications.get(idDestinataire)?.mentionDansMesure).toBe(1);
    });

    it('ne considère pas les notifications du futur', async () => {
      const idDestinataire = unUUIDRandom();
      const date = new Date();
      const dans30Jours = new Date();
      dans30Jours.setDate(dans30Jours.getDate() + 30);

      await insereUneNotification({
        idDestinataire,
        date,
      });
      await insereUneNotification({
        idDestinataire,
        date: dans30Jours,
      });

      const notifications = await persistance.lisRapportNotifications();

      expect(notifications.get(idDestinataire)?.mentionDansMesure).toBe(1);
    });

    it('ne considère que les notifications non lue', async () => {
      const idDestinataire = unUUIDRandom();
      await insereUneNotification({
        idDestinataire,
        lue: false,
      });
      await insereUneNotification({
        idDestinataire,
        lue: true,
      });

      const notifications = await persistance.lisRapportNotifications();

      expect(notifications.get(idDestinataire)).toEqual({
        mentionDansMesure: 1,
      });
    });

    it('groupe par destinataire, et compte par type de notification', async () => {
      const idDestinataire1 = unUUIDRandom();
      const idDestinataire2 = unUUIDRandom();

      await insereUneNotification({
        idDestinataire: idDestinataire1,
        // @ts-expect-error On force un type inexistant pour les compter
        type: 'TYPE_A',
      });
      await insereUneNotification({
        idDestinataire: idDestinataire1,
        // @ts-expect-error On force un type inexistant pour les compter
        type: 'TYPE_A',
      });
      await insereUneNotification({
        idDestinataire: idDestinataire1,
        // @ts-expect-error On force un type inexistant pour les compter
        type: 'TYPE_B',
      });
      await insereUneNotification({
        idDestinataire: idDestinataire2,
        // @ts-expect-error On force un type inexistant pour les compter
        type: 'TYPE_A',
      });

      const notifications = await persistance.lisRapportNotifications();

      expect(notifications.get(idDestinataire1)).toEqual({
        TYPE_A: 2,
        TYPE_B: 1,
      });
      expect(notifications.get(idDestinataire2)).toEqual({
        TYPE_A: 1,
      });
    });
  });
});
