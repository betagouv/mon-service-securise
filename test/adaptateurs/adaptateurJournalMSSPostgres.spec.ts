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

  describe("sur demande de l'évolution du nombre de services", () => {
    const unServiceCree = (idService: string, date: string) => ({
      date,
      type: 'NOUVEAU_SERVICE_CREE',
      donnees: { idService },
    });

    it('cumule les créations au fil des mois', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-05-18T08:32:18.660Z'),
        unServiceCree('S2', '2026-06-25T08:32:14.474Z'),
        unServiceCree('S3', '2026-07-29T08:30:54.761Z'),
      ]);

      const resultat = await journalMSS.evolutionNombreServices([
        'S1',
        'S2',
        'S3',
      ]);

      expect(resultat).toEqual([
        { mois: '2026-05', total: 1 },
        { mois: '2026-06', total: 2 },
        { mois: '2026-07', total: 3 },
      ]);
    });

    it('additionne les créations du même mois', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-05-02T10:00:00.000Z'),
        unServiceCree('S2', '2026-05-18T08:32:18.660Z'),
      ]);

      const resultat = await journalMSS.evolutionNombreServices(['S1', 'S2']);

      expect(resultat).toEqual([{ mois: '2026-05', total: 2 }]);
    });

    it('reporte le total sur les mois sans création', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-01-15T10:00:00.000Z'),
        unServiceCree('S2', '2026-04-15T10:00:00.000Z'),
      ]);

      const resultat = await journalMSS.evolutionNombreServices(['S1', 'S2']);

      expect(resultat).toEqual([
        { mois: '2026-01', total: 1 },
        { mois: '2026-02', total: 1 },
        { mois: '2026-03', total: 1 },
        { mois: '2026-04', total: 2 },
      ]);
    });

    it('ne tient compte que des services demandés', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-05-18T08:32:18.660Z'),
        unServiceCree('S-autre', '2026-05-19T08:32:18.660Z'),
      ]);

      const resultat = await journalMSS.evolutionNombreServices(['S1']);

      expect(resultat).toEqual([{ mois: '2026-05', total: 1 }]);
    });

    it('ne compte qu’une fois un service dont la création est consignée plusieurs fois', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-05-18T08:32:18.660Z'),
        unServiceCree('S1', '2026-07-29T08:30:54.761Z'),
      ]);

      const resultat = await journalMSS.evolutionNombreServices(['S1']);

      expect(resultat).toEqual([{ mois: '2026-05', total: 1 }]);
    });

    it('ne tient compte que des évènements de création de service', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-05-18T08:32:18.660Z'),
        {
          date: '2026-06-18T08:32:18.660Z',
          type: 'UN_AUTRE_TYPE',
          donnees: { idService: 'S1' },
        },
      ]);

      const resultat = await journalMSS.evolutionNombreServices(['S1']);

      expect(resultat).toEqual([{ mois: '2026-05', total: 1 }]);
    });

    it("ne retourne rien quand aucun service n'a été créé", async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);

      expect(await journalMSS.evolutionNombreServices(['S1'])).toEqual([]);
    });

    it('ne retourne rien quand aucun service n’est demandé', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-05-18T08:32:18.660Z'),
      ]);

      expect(await journalMSS.evolutionNombreServices([])).toEqual([]);
    });
  });

  describe("sur demande de l'évolution du nombre d'organisations", () => {
    const unServiceCree = (idService: string, date: string) => ({
      date,
      type: 'NOUVEAU_SERVICE_CREE',
      donnees: { idService },
    });

    it('ne compte une organisation qu’à la création de son premier service', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-05-18T08:32:18.660Z'),
        unServiceCree('S2', '2026-07-29T08:30:54.761Z'),
      ]);

      const resultat = await journalMSS.evolutionNombreOrganisations([
        { idServiceHache: 'S1', siretHache: 'SIRET_A' },
        { idServiceHache: 'S2', siretHache: 'SIRET_A' },
      ]);

      expect(resultat).toEqual([{ mois: '2026-05', total: 1 }]);
    });

    it('cumule les organisations distinctes au fil des mois', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-05-18T08:32:18.660Z'),
        unServiceCree('S2', '2026-06-25T08:32:14.474Z'),
        unServiceCree('S3', '2026-06-26T08:32:14.474Z'),
      ]);

      const resultat = await journalMSS.evolutionNombreOrganisations([
        { idServiceHache: 'S1', siretHache: 'SIRET_A' },
        { idServiceHache: 'S2', siretHache: 'SIRET_B' },
        { idServiceHache: 'S3', siretHache: 'SIRET_A' },
      ]);

      expect(resultat).toEqual([
        { mois: '2026-05', total: 1 },
        { mois: '2026-06', total: 2 },
      ]);
    });

    it('retient le premier service créé, quel que soit son ordre en base', async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);
      await trx('journal_mss.evenements').insert([
        unServiceCree('S1', '2026-07-29T08:30:54.761Z'),
        unServiceCree('S2', '2026-05-18T08:32:18.660Z'),
      ]);

      const resultat = await journalMSS.evolutionNombreOrganisations([
        { idServiceHache: 'S1', siretHache: 'SIRET_A' },
        { idServiceHache: 'S2', siretHache: 'SIRET_A' },
      ]);

      expect(resultat[0]).toEqual({ mois: '2026-05', total: 1 });
    });

    it("ne retourne rien quand aucune organisation n'est demandée", async () => {
      const journalMSS = new AdaptateurJournalMSSPostgres(trx);

      expect(await journalMSS.evolutionNombreOrganisations([])).toEqual([]);
    });
  });
});
