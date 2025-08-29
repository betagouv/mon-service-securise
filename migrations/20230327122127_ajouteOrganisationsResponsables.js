import pourChaqueLigne from './utilitaires/pourChaqueLigne.js';

const ajouteOrganisationsResponsables = (knex, table) =>
  pourChaqueLigne(
    knex(table)
      .join(
        'autorisations',
        `${table}.id`,
        knex.raw("(autorisations.donnees ->> 'idService')::UUID")
      )
      .join(
        'utilisateurs',
        knex.raw("(autorisations.donnees ->> 'idUtilisateur')::UUID"),
        'utilisateurs.id'
      )
      .whereRaw("utilisateurs.donnees ->> 'nomEntitePublique' IS NOT NULL")
      .whereRaw("autorisations.donnees ->> 'type' = 'createur'")
      .select({
        id: `${table}.id`,
        donnees: `${table}.donnees`,
        nomEntitePublique: knex.raw(
          "utilisateurs.donnees ->> 'nomEntitePublique'"
        ),
      }),
    ({ id, donnees, nomEntitePublique }) => {
      donnees.descriptionService.organisationsResponsables = [
        nomEntitePublique,
      ];
      return knex(table).where({ id }).update({ donnees });
    }
  );

const retireOrganisationsResponsables = (knex, table) =>
  pourChaqueLigne(knex(table), ({ id, donnees }) => {
    delete donnees.descriptionService.organisationsResponsables;
    return knex(table).where({ id }).update({ donnees });
  });

export const up = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      ajouteOrganisationsResponsables(knex, table)
    )
  );

export const down = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      retireOrganisationsResponsables(knex, table)
    )
  );
