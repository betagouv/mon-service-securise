import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import 'tsx/esm'; // Pour que `knex.migrate.latest()` s'exécute dans un écosytème où il comprend typescript. Car dans les tests, `tsc` ne s'exécute jamais.
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import { AdaptateurPostgresTS } from '../../src/adaptateurs/adaptateurPostgresTS.ts';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';
import { PersistanceTS } from '../../src/adaptateurs/persistanceTS.interface';

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
});
