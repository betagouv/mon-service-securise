import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import 'tsx/esm'; // Pour que `knex.migrate.latest()` s'exécute dans un écosytème où il comprend typescript. Car dans les tests, `tsc` ne s'exécute jamais.
import { AdaptateurStatistiquesPostgres } from '../../src/adaptateurs/adaptateurStatistiquesPostgres.ts';
import { AdaptateurStatistiques } from '../../src/adaptateurs/adaptateurStatistiques.interface.ts';
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import { IdStatutMesure } from '../../src/referentiel.types.ts';

describe("L'adaptateur de statistiques publiques Postgres", () => {
  let knex: Knex.Knex;
  let trx: Knex.Knex.Transaction;
  let knexJournal: Knex.Knex;
  let trxJournal: Knex.Knex.Transaction;
  let adaptateur: AdaptateurStatistiques;

  beforeAll(async () => {
    knex = Knex({ client: ClientPgLite, dialect: 'postgres', connection: {} });
    await knex.migrate.latest();

    knexJournal = Knex({
      client: ClientPgLite,
      dialect: 'postgres',
      connection: {},
    });
    await knexJournal.schema.createSchema('journal_mss');
    await knexJournal.schema
      .withSchema('journal_mss')
      .createTable('evenements', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.timestamp('date');
        table.text('type');
        table.jsonb('donnees');
      })
      .createTable('donnees_statuts_des_mesures', (table) => {
        table.text('id_service');
        table.text('id_mesure');
        table.text('statut');
        table.timestamp('date');
        table.text('version_service');
      });
  });

  beforeEach(async () => {
    trx = await knex.transaction();
    trxJournal = await knexJournal.transaction();
    adaptateur = new AdaptateurStatistiquesPostgres({
      knex: trx,
      knexJournal: trxJournal,
    });
  });

  afterEach(async () => {
    await trx.rollback();
    await trxJournal.rollback();
  });

  afterAll(async () => {
    await knex.destroy();
    await knexJournal.destroy();
  });

  const inscrisUnUtilisateur = async (avecAcceptationCGU = true) => {
    const idUtilisateur = unUUIDRandom();

    await trxJournal('journal_mss.evenements').insert({
      date: new Date(),
      type: 'NOUVEL_UTILISATEUR_INSCRIT',
      donnees: { idUtilisateur },
    });
    if (avecAcceptationCGU)
      await trxJournal('journal_mss.evenements').insert({
        date: new Date(),
        type: 'CGU_ACCEPTEES',
        donnees: { idUtilisateur },
      });
  };

  const ajouteUnService = async () =>
    trx('services').insert({
      id: unUUIDRandom(),
      nom_service_hash: `nom-service-hash-${unUUIDRandom()}`,
    });

  const ajouteUneMesureAvecStatut = async (statut: IdStatutMesure) =>
    trxJournal('journal_mss.donnees_statuts_des_mesures').insert({
      id_service: unUUIDRandom(),
      id_mesure: unUUIDRandom(),
      statut,
      date: new Date(),
      version_service: 'v2',
    });

  describe("concernant le nombre d'utilisateurs", () => {
    it("sait donner le nombre total d'inscription", async () => {
      await inscrisUnUtilisateur();
      await inscrisUnUtilisateur();

      const resultat = await adaptateur.recupereStatistiques();

      expect(resultat.utilisateurs.nombre).toBe(2);
    });

    it('ne considère que les utilisateurs ayants accepté les CGU', async () => {
      await inscrisUnUtilisateur();
      await inscrisUnUtilisateur(false);

      const resultat = await adaptateur.recupereStatistiques();

      expect(resultat.utilisateurs.nombre).toBe(1);
    });
  });

  it('sait donner le nombre de services', async () => {
    await ajouteUnService();
    await ajouteUnService();

    const resultat = await adaptateur.recupereStatistiques();

    expect(resultat.services.nombre).toBe(2);
  });

  describe('sur demande du nombre de vulnérabilité', () => {
    it('sait donner le nombre total de mesures', async () => {
      await ajouteUneMesureAvecStatut('fait');
      await ajouteUneMesureAvecStatut('enCours');

      const resultat = await adaptateur.recupereStatistiques();

      expect(resultat.vulnerabilites.nombre).toBe(2);
    });

    it('ne prend en compte que les statuts "fait" et "enCours"', async () => {
      await ajouteUneMesureAvecStatut('fait');
      await ajouteUneMesureAvecStatut('enCours');
      await ajouteUneMesureAvecStatut('aLancer');

      const resultat = await adaptateur.recupereStatistiques();

      expect(resultat.vulnerabilites.nombre).toBe(2);
    });
  });
});
