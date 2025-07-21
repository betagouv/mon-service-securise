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

  prototypeQueryBuilder.first = async function (...args) {
    const resultat = firstOriginal.apply(this, args);
    if (typeof resultat.then === 'function') {
      const res = await resultat;
      return res && res.rows.length === 0 ? undefined : res;
    }
    return resultat;
  };
}

describe("L'adaptateur persistance Postgres", () => {
  let knex;
  let persistance;

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
});
