import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import 'tsx/esm'; // Pour que `knex.migrate.latest()` s'exécute dans un écosytème où il comprend typescript. Car dans les tests, `tsc` ne s'exécute jamais.
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import { AdaptateurPostgresTS } from '../../src/adaptateurs/adaptateurPostgresTS.ts';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface.js';

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

  describe("sur demande de lecture des admins d'une organisation", () => {
    it("retourne une liste vide s'il n'en existe pas", async () => {
      const admin = await persistance.lisAdminsOrganisation('siret-inconnu');

      expect(admin).toEqual([]);
    });

    it('peut lire des admins chiffrés', async () => {
      const idAdmin1 = unUUIDRandom();
      const idAdmin2 = unUUIDRandom();
      const donneesEntite1 = { nom: 'nom', siret: 'SIRET', departement: '75' };
      const donneesEntite2 = {
        nom: 'nom2',
        siret: 'SIRET2',
        departement: '75',
      };
      const siretHash = chiffrement.hacheSha256('SIRET');
      await trx.table('admins_organisations').insert({
        id_utilisateur: idAdmin1,
        siret_hash: siretHash,
        donnees: await chiffrement.chiffre(donneesEntite1),
      });
      await trx.table('admins_organisations').insert({
        id_utilisateur: idAdmin2,
        siret_hash: siretHash,
        donnees: await chiffrement.chiffre(donneesEntite1),
      });
      await trx.table('admins_organisations').insert({
        id_utilisateur: idAdmin2,
        siret_hash: chiffrement.hacheSha256('SIRET2'),
        donnees: await chiffrement.chiffre(donneesEntite2),
      });

      const [admin, admin2] = await persistance.lisAdminsOrganisation('SIRET');

      expect(admin).toEqual({
        idUtilisateur: idAdmin1,
        entitesAdministrees: [donneesEntite1],
      });
      expect(admin2).toEqual({
        idUtilisateur: idAdmin2,
        entitesAdministrees: [donneesEntite1, donneesEntite2],
      });
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
  });
});
