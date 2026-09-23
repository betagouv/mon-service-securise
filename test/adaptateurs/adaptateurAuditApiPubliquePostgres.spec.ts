import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import 'tsx/esm'; // Pour que `knex.migrate.latest()` s'exécute dans un écosytème où il comprend typescript. Car dans les tests, `tsc` ne s'exécute jamais.
import { AdaptateurAuditApiPubliquePostgres } from '../../src/adaptateurs/adaptateurAuditApiPubliquePostgres.ts';
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';

describe("L'adaptateur d'audit de l'API publique", () => {
  let knex: Knex.Knex;
  let trx: Knex.Knex.Transaction;

  beforeAll(async () => {
    knex = Knex({ client: ClientPgLite, dialect: 'postgres', connection: {} });
    await knex.migrate.latest();
  });

  beforeEach(async () => {
    trx = await knex.transaction();
  });

  afterEach(async () => {
    await trx.rollback();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it("peut sauvegarder une trace d'appel à l'API publique, en chiffrant l'adresse IP", async () => {
    const idCleApi = unUUIDRandom();
    const idUtilisateur = unUUIDRandom();
    const audit = new AdaptateurAuditApiPubliquePostgres({
      knex: trx,
      adaptateurChiffrement: unAdaptateurChiffrementQuiWrap(),
    });

    await audit.trace({
      idCleApi,
      idUtilisateur,
      route: '/v1/services',
      adresseIp: '1.2.3.4',
    });

    const toutesEntrees = await trx('api_publique_audit').select();
    expect(toutesEntrees).toEqual([
      {
        id: expect.any(String),
        id_cle_api: idCleApi,
        id_utilisateur: idUtilisateur,
        route: '/v1/services',
        adresse_ip: { chiffre: true, coffreFort: '1.2.3.4' },
        date: expect.any(Date),
      },
    ]);
  });
});
