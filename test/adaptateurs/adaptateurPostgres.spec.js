const expect = require('expect.js');
const Knex = require('knex');
const ClientPgLite = require('knex-pglite');
const {
  nouvelAdaptateur,
} = require('../../src/adaptateurs/adaptateurPostgres');
const { genereUUID } = require('../../src/adaptateurs/adaptateurUUID');
const Autorisation = require('../../src/modeles/autorisations/autorisation');

function patchKnexFirst(knexInstance) {
  const prototypeQueryBuilder = Object.getPrototypeOf(
    knexInstance.queryBuilder()
  );

  const firstOriginal = prototypeQueryBuilder.first;

  // eslint-disable-next-line func-names
  prototypeQueryBuilder.first = async function (...args) {
    const resultat = await firstOriginal.apply(this, args);
    return resultat && resultat.rows.length === 0 ? undefined : resultat;
  };
}

describe("L'adaptateur persistance Postgres", () => {
  let knex;
  let persistance;
  const ID_UTILISATEUR_1 = genereUUID();
  const ID_UTILISATEUR_2 = genereUUID();

  before(async () => {
    knex = Knex({
      client: ClientPgLite,
      dialect: 'postgres',
      connection: {},
    });
    patchKnexFirst(knex);
    await knex.migrate.latest();
    persistance = nouvelAdaptateur({ knexSurcharge: knex });
  });

  afterEach(async () => {
    await Promise.all(
      ['services', 'suggestions_actions'].map((table) => knex(table).truncate())
    );
  });

  after(async () => {
    await knex.destroy();
  });

  async function insereService() {
    const idService = genereUUID();
    await persistance.sauvegardeService(idService, {}, 'service-1', 'siret-1');
    return idService;
  }

  async function insereUtilisateur() {
    const idUtilisateur = genereUUID();
    await persistance.ajouteUtilisateur(idUtilisateur, {}, 'email');
    return idUtilisateur;
  }

  async function insereAutorisation(idUtilisateur, idService) {
    const idAutorisation = genereUUID();
    const autorisation = Autorisation.NouvelleAutorisationProprietaire({
      idUtilisateur,
      idService,
    });
    await persistance.ajouteAutorisation(
      idAutorisation,
      autorisation.donneesAPersister()
    );
  }

  describe('concernant la lecture complète de service', () => {
    it("sait lire les suggestions d'action d'un service", async () => {
      const idService = await insereService();
      await persistance.ajouteSuggestionAction({
        idService,
        nature: 'une nature',
      });

      const services = await persistance.servicesComplets({ idService });

      expect(services[0].suggestions).to.eql(['une nature']);
    });

    it("sait lire les contributeurs d'un service", async () => {
      const idService = await insereService();
      const idUtilisateur = await insereUtilisateur();
      await insereAutorisation(idUtilisateur, idService);

      const services = await persistance.servicesComplets({ idService });

      const proprietaire = services[0].utilisateurs[0];
      expect(proprietaire.id).to.be(idUtilisateur);
      expect(proprietaire.email_hash).to.be('email');
    });

    it('sait lire les modèles de mesure spécifique disponible pour un service', async () => {
      const idService = await insereService();
      const idUtilisateur = await insereUtilisateur();
      await insereAutorisation(idUtilisateur, idService);

      const idModele = genereUUID();
      await persistance.ajouteModeleMesureSpecifique(idModele, idUtilisateur, {
        description: 'Une description',
      });

      const services = await persistance.servicesComplets({ idService });

      expect(services[0].modelesDisponiblesDeMesureSpecifique).to.eql([
        {
          id: idModele,
          donnees: { description: 'Une description' },
          id_utilisateur: idUtilisateur,
        },
      ]);
    });
  });

  describe('concernant la lecture des modèles de mesure spécifique', () => {
    async function insereModeleMesureSpecifique(donnees) {
      const id = genereUUID();
      await knex('modeles_mesure_specifique').insert({
        ...donnees,
        id,
      });
      return id;
    }

    it("sait lire les modèles de mesure spécifique d'un utilisateur", async () => {
      const idModele1 = await insereModeleMesureSpecifique({
        id_utilisateur: ID_UTILISATEUR_1,
        donnees: {},
      });
      await insereModeleMesureSpecifique({
        id_utilisateur: ID_UTILISATEUR_2,
        donnees: {},
      });

      const modeles =
        await persistance.lisModelesMesureSpecifiquePourUtilisateur(
          ID_UTILISATEUR_1
        );

      expect(modeles).to.eql([
        { id: idModele1, id_utilisateur: ID_UTILISATEUR_1, donnees: {} },
      ]);
    });
  });
});
