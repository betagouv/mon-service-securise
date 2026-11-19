import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import { MiseAJourObservatoire } from '../../src/taches/metsAJourObservatoire.ts';
import type { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import type { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.ts';
import type { AdaptateurRechercheEntreprise } from '../../src/adaptateurs/adaptateurRechercheEntreprise.interface.ts';

type ServiceSimplifie = {
  id: string;
  descriptionService: {
    niveauSecurite: string;
    organisationResponsable: { siret: string };
  };
};

const unService = (
  id: string,
  { niveauSecurite = 'niveau1', siret = '12345678900011' } = {}
): ServiceSimplifie => ({
  id,
  descriptionService: {
    niveauSecurite,
    organisationResponsable: { siret },
  },
});

const hache = (id: string) => `hash-${id}`;

const unServiceCree = (idService: string, date: string) => ({
  date,
  type: 'NOUVEAU_SERVICE_CREE',
  donnees: { idService: hache(idService) },
});

const uneCompletudeModifiee = (
  idService: string,
  date: string,
  statuts: string[]
) => ({
  date,
  type: 'COMPLETUDE_SERVICE_MODIFIEE',
  donnees: {
    idService: hache(idService),
    detailMesures: statuts.map((statut, index) => ({
      idMesure: `mesure-${index}`,
      statut,
    })),
  },
});

const uneHomologationCreee = (
  idService: string,
  date: string,
  refusee = false
) => ({
  date,
  type: 'NOUVELLE_HOMOLOGATION_CREEE',
  donnees: { idService: hache(idService), refusee },
});

describe("La tâche de mise à jour de l'observatoire", () => {
  let knexMSS: Knex.Knex;
  let trxMSS: Knex.Knex.Transaction;
  let knexJournal: Knex.Knex;
  let trxJournal: Knex.Knex.Transaction;
  let services: ServiceSimplifie[];
  let siretsRecherches: string[];

  const creeTablesObservatoire = async () => {
    await knexMSS.schema
      .createTable('executions', (table) => {
        table.timestamp('date_execution');
      })
      .createTable('services_crees', (table) => {
        table.text('id_hash').primary();
        table.timestamp('date_creation');
        table.text('niveau_securite');
        table.text('departement');
        table.text('region');
        table.text('secteur_activite');
        table.text('type_organisation');
      })
      .createTable('mesures_faites', (table) => {
        table.text('id_hash_service');
        table.date('date');
        table.integer('total_faites');
        table.unique(['id_hash_service', 'date']);
      })
      .createTable('homologations_realisees', (table) => {
        table.text('id_hash_service');
        table.date('date');
        table.integer('total_realisees');
        table.unique(['id_hash_service', 'date']);
      });
  };

  const creeTableJournal = async () => {
    await knexJournal.schema.createSchema('journal_mss');
    await knexJournal.schema
      .withSchema('journal_mss')
      .createTable('evenements', (table) => {
        table
          .uuid('id')
          .primary()
          .defaultTo(knexJournal.raw('gen_random_uuid()'));
        table.timestamp('date');
        table.text('type');
        table.jsonb('donnees');
      });
  };

  beforeAll(async () => {
    knexMSS = Knex({
      client: ClientPgLite,
      dialect: 'postgres',
      connection: {},
    });
    knexJournal = Knex({
      client: ClientPgLite,
      dialect: 'postgres',
      connection: {},
    });
    await creeTablesObservatoire();
    await creeTableJournal();
  });

  beforeEach(async () => {
    trxMSS = await knexMSS.transaction();
    trxJournal = await knexJournal.transaction();
    services = [];
    siretsRecherches = [];
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-19T10:00:00.000Z'));
  });

  afterEach(async () => {
    vi.useRealTimers();
    await trxMSS.rollback();
    await trxJournal.rollback();
  });

  afterAll(async () => {
    await knexMSS.destroy();
    await knexJournal.destroy();
  });

  const tache = () =>
    new MiseAJourObservatoire({
      knexMSS: trxMSS,
      knexJournal: trxJournal,
      depotDonnees: {
        tousLesServices: async () => services,
      } as unknown as DepotDonnees,
      adaptateurChiffrement: {
        hacheSha256: hache,
      } as unknown as AdaptateurChiffrement,
      adaptateurRechercheEntreprise: {
        recupereDetailsOrganisation: async (siret: string) => {
          siretsRecherches.push(siret);
          return {
            departement: '33',
            region: '75',
            sectionActivitePrincipale: 'L',
            trancheEffectifSalarie: '12',
          };
        },
      } as unknown as AdaptateurRechercheEntreprise,
    });

  const consigneDansLeJournal = async (...evenements: object[]) =>
    trxJournal('journal_mss.evenements').insert(evenements);

  const aDejaEteExecuteeLe = async (date: string) =>
    trxMSS('executions').insert({ date_execution: date });

  const servicesCrees = () =>
    trxMSS('services_crees').select().orderBy('id_hash');

  const lignesMensuelles = (table: string, colonneValeur: string) =>
    trxMSS(table)
      .select(
        'id_hash_service as idHashService',
        trxMSS.raw(`to_char(date, 'YYYY-MM-DD') as date`),
        `${colonneValeur} as valeur`
      )
      .orderBy(['id_hash_service', 'date']);

  const mesuresFaites = () =>
    lignesMensuelles('mesures_faites', 'total_faites');

  const homologationsRealisees = () =>
    lignesMensuelles('homologations_realisees', 'total_realisees');

  describe('concernant les exécutions', () => {
    it("consigne la date de l'exécution", async () => {
      await tache().execute();

      const executions = await trxMSS('executions').select();
      expect(executions).toEqual([
        { date_execution: new Date('2026-11-19T10:00:00.000Z') },
      ]);
    });

    it("n'écrit aucune valeur mensuelle quand le journal est vide", async () => {
      services = [unService('S1')];

      await tache().execute();

      expect(await mesuresFaites()).toEqual([]);
      expect(await homologationsRealisees()).toEqual([]);
    });
  });

  describe('concernant les services créés', () => {
    it('ajoute un nouveau service avec sa date de création issue du journal et les détails de son organisation', async () => {
      services = [
        unService('S1', { niveauSecurite: 'niveau2', siret: 'SIRET-1' }),
      ];
      await consigneDansLeJournal(
        unServiceCree('S1', '2026-03-12T08:00:00.000Z')
      );

      await tache().execute();

      expect(await servicesCrees()).toEqual([
        {
          id_hash: 'hash-S1',
          date_creation: new Date('2026-03-12T08:00:00.000Z'),
          niveau_securite: 'Modérés',
          departement: '33',
          region: '75',
          secteur_activite: 'L',
          type_organisation: '12',
        },
      ]);
      expect(siretsRecherches).toEqual(['SIRET-1']);
    });

    it("utilise la date d'exécution comme date de création quand le journal ne la connaît pas", async () => {
      services = [unService('S1')];

      await tache().execute();

      const [service] = await servicesCrees();
      expect(service.date_creation).toEqual(
        new Date('2026-11-19T10:00:00.000Z')
      );
    });

    it("ne met à jour que le niveau de sécurité d'un service déjà connu, sans réinterroger l'API Recherche Entreprise", async () => {
      await trxMSS('services_crees').insert({
        id_hash: 'hash-S1',
        date_creation: new Date('2026-03-12T08:00:00.000Z'),
        niveau_securite: 'Élémentaires',
        departement: '75',
        region: '11',
        secteur_activite: 'O',
        type_organisation: '03',
      });
      services = [unService('S1', { niveauSecurite: 'niveau3' })];

      await tache().execute();

      expect(await servicesCrees()).toEqual([
        {
          id_hash: 'hash-S1',
          date_creation: new Date('2026-03-12T08:00:00.000Z'),
          niveau_securite: 'Importants',
          departement: '75',
          region: '11',
          secteur_activite: 'O',
          type_organisation: '03',
        },
      ]);
      expect(siretsRecherches).toEqual([]);
    });
  });

  describe('concernant les mesures faites', () => {
    beforeEach(() => {
      services = [unService('S1')];
    });

    it('lors de la première exécution, calcule depuis le premier mois du journal en datant chaque valeur du 1er du mois suivant', async () => {
      await consigneDansLeJournal(
        uneCompletudeModifiee('S1', '2026-09-10T08:00:00.000Z', [
          'fait',
          'enCours',
        ])
      );

      await tache().execute();

      expect(await mesuresFaites()).toEqual([
        { idHashService: 'hash-S1', date: '2026-10-01', valeur: 1 },
        { idHashService: 'hash-S1', date: '2026-11-01', valeur: 1 },
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 1 },
      ]);
    });

    it('retient le dernier évènement du mois', async () => {
      await consigneDansLeJournal(
        uneCompletudeModifiee('S1', '2026-11-02T08:00:00.000Z', ['fait']),
        uneCompletudeModifiee('S1', '2026-11-15T08:00:00.000Z', [
          'fait',
          'fait',
          'fait',
        ]),
        uneCompletudeModifiee('S1', '2026-11-08T08:00:00.000Z', [
          'fait',
          'fait',
        ])
      );

      await tache().execute();

      expect(await mesuresFaites()).toEqual([
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 3 },
      ]);
    });

    it('fait évoluer la valeur au fil des mois', async () => {
      await consigneDansLeJournal(
        uneCompletudeModifiee('S1', '2026-09-10T08:00:00.000Z', ['fait']),
        uneCompletudeModifiee('S1', '2026-11-10T08:00:00.000Z', [
          'fait',
          'fait',
        ])
      );

      await tache().execute();

      expect(await mesuresFaites()).toEqual([
        { idHashService: 'hash-S1', date: '2026-10-01', valeur: 1 },
        { idHashService: 'hash-S1', date: '2026-11-01', valeur: 1 },
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 2 },
      ]);
    });

    it('compte zéro mesure faite quand le détail des mesures est absent', async () => {
      await consigneDansLeJournal({
        date: '2026-11-10T08:00:00.000Z',
        type: 'COMPLETUDE_SERVICE_MODIFIEE',
        donnees: { idService: 'hash-S1' },
      });

      await tache().execute();

      expect(await mesuresFaites()).toEqual([
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 0 },
      ]);
    });

    it("ignore les services absents de l'observatoire", async () => {
      await consigneDansLeJournal(
        uneCompletudeModifiee('S-supprime', '2026-11-10T08:00:00.000Z', [
          'fait',
        ])
      );

      await tache().execute();

      expect(await mesuresFaites()).toEqual([]);
    });

    it('rattache au mois UTC un évènement survenu en fin de mois', async () => {
      await consigneDansLeJournal(
        uneCompletudeModifiee('S1', '2026-10-31T23:30:00.000Z', ['fait'])
      );

      await tache().execute();

      expect(await mesuresFaites()).toEqual([
        { idHashService: 'hash-S1', date: '2026-11-01', valeur: 1 },
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 1 },
      ]);
    });

    it("lors d'une exécution suivante, repart de la valeur connue au début du mois de la dernière exécution", async () => {
      await trxMSS('services_crees').insert({
        id_hash: 'hash-S1',
      });
      await trxMSS('mesures_faites').insert({
        id_hash_service: 'hash-S1',
        date: '2026-10-01',
        total_faites: 4,
      });
      await aDejaEteExecuteeLe('2026-10-20T10:00:00.000Z');
      await consigneDansLeJournal(
        uneCompletudeModifiee('S1', '2026-08-10T08:00:00.000Z', ['fait']),
        uneCompletudeModifiee('S1', '2026-11-10T08:00:00.000Z', [
          'fait',
          'fait',
          'fait',
          'fait',
          'fait',
        ])
      );

      await tache().execute();

      expect(await mesuresFaites()).toEqual([
        { idHashService: 'hash-S1', date: '2026-10-01', valeur: 4 },
        { idHashService: 'hash-S1', date: '2026-11-01', valeur: 4 },
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 5 },
      ]);
    });
  });

  describe('concernant les homologations réalisées', () => {
    beforeEach(() => {
      services = [unService('S1')];
    });

    it('cumule les homologations au fil des mois et reporte le total sur les mois sans homologation', async () => {
      await consigneDansLeJournal(
        uneHomologationCreee('S1', '2026-09-10T08:00:00.000Z'),
        uneHomologationCreee('S1', '2026-09-20T08:00:00.000Z'),
        uneHomologationCreee('S1', '2026-11-10T08:00:00.000Z')
      );

      await tache().execute();

      expect(await homologationsRealisees()).toEqual([
        { idHashService: 'hash-S1', date: '2026-10-01', valeur: 2 },
        { idHashService: 'hash-S1', date: '2026-11-01', valeur: 2 },
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 3 },
      ]);
    });

    it('ignore les homologations refusées', async () => {
      await consigneDansLeJournal(
        uneHomologationCreee('S1', '2026-11-10T08:00:00.000Z'),
        uneHomologationCreee('S1', '2026-11-12T08:00:00.000Z', true)
      );

      await tache().execute();

      expect(await homologationsRealisees()).toEqual([
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 1 },
      ]);
    });

    it("ignore les services absents de l'observatoire", async () => {
      await consigneDansLeJournal(
        uneHomologationCreee('S-supprime', '2026-11-10T08:00:00.000Z')
      );

      await tache().execute();

      expect(await homologationsRealisees()).toEqual([]);
    });

    it("lors d'une exécution suivante, ajoute les nouvelles homologations au total connu sans recompter les mois précédents", async () => {
      await trxMSS('services_crees').insert({
        id_hash: 'hash-S1',
      });
      await trxMSS('homologations_realisees').insert({
        id_hash_service: 'hash-S1',
        date: '2026-10-01',
        total_realisees: 3,
      });
      await aDejaEteExecuteeLe('2026-10-20T10:00:00.000Z');
      await consigneDansLeJournal(
        uneHomologationCreee('S1', '2026-08-10T08:00:00.000Z'),
        uneHomologationCreee('S1', '2026-10-05T08:00:00.000Z'),
        uneHomologationCreee('S1', '2026-11-10T08:00:00.000Z')
      );

      await tache().execute();

      expect(await homologationsRealisees()).toEqual([
        { idHashService: 'hash-S1', date: '2026-10-01', valeur: 3 },
        { idHashService: 'hash-S1', date: '2026-11-01', valeur: 4 },
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 5 },
      ]);
    });

    it('rejouer la tâche dans le même mois ne double pas les homologations', async () => {
      await consigneDansLeJournal(
        uneHomologationCreee('S1', '2026-11-10T08:00:00.000Z')
      );

      await tache().execute();
      vi.setSystemTime(new Date('2026-11-20T10:00:00.000Z'));
      await tache().execute();

      expect(await homologationsRealisees()).toEqual([
        { idHashService: 'hash-S1', date: '2026-12-01', valeur: 1 },
      ]);
    });
  });
});
