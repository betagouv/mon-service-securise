import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import { AdaptateurJournalMSSPostgres } from '../../src/adaptateurs/adaptateurJournalMSSPostgres.ts';

describe("L'adaptateur Postgres du Journal MSS", () => {
  let knex: Knex.Knex;
  let trx: Knex.Knex.Transaction;

  beforeAll(async () => {
    knex = Knex({ client: ClientPgLite, dialect: 'postgres', connection: {} });
    await knex.schema.createSchema('journal_mss');
    await knex.schema
      .withSchema('journal_mss')
      .createTable('evenements', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.timestamp('date');
        table.text('type');
        table.jsonb('donnees');
      });
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

  it('peut consigner un évènement', async () => {
    const journalMSS = new AdaptateurJournalMSSPostgres(trx);

    await journalMSS.consigneEvenement({
      date: new Date(),
      type: 'UN_TYPE',
      donnees: { a: 1 },
    });

    const evenements = await trx('journal_mss.evenements').select();

    expect(evenements).toEqual([
      {
        id: expect.any(String),
        date: expect.any(Date),
        type: 'UN_TYPE',
        donnees: {
          a: 1,
        },
      },
    ]);
  });
});
