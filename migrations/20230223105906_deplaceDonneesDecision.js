const pourChaqueLigne = require('./utilitaires/pourChaqueLigne');

function rangeDonneesDansDecision(knex, table) {
  const traiteDossiers = (dossiers) =>
    dossiers.map((d) => {
      const presenceDonneesADeplacer = d.dateHomologation || d.dureeValidite;
      if (!presenceDonneesADeplacer) return d;

      d.decision = {
        dateHomologation: d.dateHomologation,
        dureeValidite: d.dureeValidite,
      };
      delete d.dateHomologation;
      delete d.dureeValidite;

      return d;
    });

  return pourChaqueLigne(
    knex(table).whereRaw("donnees->'dossiers' IS NOT NULL"),
    ({ id, donnees }) =>
      knex(table)
        .where({ id })
        .update({
          donnees: { ...donnees, dossiers: traiteDossiers(donnees.dossiers) },
        })
  );
}

function remetDonneesARacine(knex, table) {
  const traiteDossiers = (dossiers) =>
    dossiers.map((d) => {
      if (!d.decision) return d;

      d.dateHomologation = d.decision.dateHomologation;
      d.dureeValidite = d.decision.dureeValidite;
      delete d.decision;

      return d;
    });

  return pourChaqueLigne(
    knex(table).whereRaw("donnees->'dossiers' IS NOT NULL"),
    ({ id, donnees }) =>
      knex(table)
        .where({ id })
        .update({
          donnees: { ...donnees, dossiers: traiteDossiers(donnees.dossiers) },
        })
  );
}

exports.up = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      rangeDonneesDansDecision(knex, table)
    )
  );

exports.down = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      remetDonneesARacine(knex, table)
    )
  );
