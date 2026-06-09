import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import 'tsx/esm'; // Pour que `knex.migrate.latest()` s'exécute dans un écosytème où il comprend typescript. Car dans les tests, `tsc` ne s'exécute jamais.
import { AdaptateurAuditAdminOrganisationsPostgres } from '../../src/adaptateurs/adaptateurAuditAdminOrganisationsPostgres.ts';
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import Entite from '../../src/modeles/entite.ts';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';

describe("L'adaptateur d'audit de l'administration des organisations", () => {
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

  it("peut sauvegarder une trace d'administration des orgas", async () => {
    const idUtilisateurCible = unUUIDRandom();
    const idAdmin = unUUIDRandom();
    const idService = unUUIDRandom();
    const adaptateurChiffrement = unAdaptateurChiffrementQuiWrap();
    const audit = new AdaptateurAuditAdminOrganisationsPostgres({
      knex: trx,
      adaptateurChiffrement,
    });
    const entite = new Entite({ siret: '1234' });

    await audit.trace({
      acteur: unUtilisateur()
        .avecId(idAdmin)
        .avecEmail('acteur@mail.fr')
        .construis(),
      utilisateurCible: unUtilisateur()
        .avecEmail('cible@mail.fr')
        .avecId(idUtilisateurCible)
        .construis(),
      serviceCible: unServiceV2()
        .avecId(idService)
        .avecOrganisationResponsable(entite)
        .construis(),
      entiteCible: entite,
      typeAction: 'ATTRIBUTION_ROLE',
      donneesSupplementaires: { role: 'PROPRIETAIRE' },
    });

    const toutesEntrees = await trx('admins_organisations_audit').select();
    expect(toutesEntrees).toEqual([
      {
        id_acteur: idAdmin,
        email_acteur_hash: 'acteur@mail.fr-haché256',
        id_utilisateur_cible: idUtilisateurCible,
        email_utilisateur_cible_hash: 'cible@mail.fr-haché256',
        type_action: 'ATTRIBUTION_ROLE',
        siret_hash: '1234-haché256',
        id_service_cible: idService,
        date_action: expect.any(Date),
        id: expect.any(String),
        donnees: {
          chiffre: true,
          coffreFort: {
            siret: '1234',
            emailActeur: 'acteur@mail.fr',
            emailCible: 'cible@mail.fr',
            role: 'PROPRIETAIRE',
          },
        },
      },
    ]);
  });
});
