const Knex = require('knex');
const { sign } = require('jsonwebtoken');

const adaptateurSupervisionMetabase = ({
  adaptateurChiffrement,
  adaptateurEnvironnement,
}) => {
  const config = {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
    pool: { min: 0, max: 10 },
  };

  const correspondancesFiltreDate = {
    aujourdhui: 'thisday',
    hier: 'past1days',
    septDerniersJours: 'past7days',
    trenteDerniersJours: 'past30days',
    unDernierMois: 'past1months',
    troisDerniersMois: 'past3months',
    douzeDerniersMois: 'past12months',
  };

  const knex = Knex(config);

  const hache = (id) => adaptateurChiffrement.hacheSha256(id);

  return {
    delieServiceDesSuperviseurs: async (idService) => {
      const idServiceHash = hache(idService);
      await knex('journal_mss.superviseurs')
        .where('id_service', idServiceHash)
        .del();
    },
    genereURLSupervision: (idSuperviseur, filtres) => {
      const urlDeBase = adaptateurEnvironnement
        .supervision()
        .domaineMetabaseMSS();
      const cleSecreteIntegration = adaptateurEnvironnement
        .supervision()
        .cleSecreteIntegrationMetabase();
      const idDashboardSupervision = adaptateurEnvironnement
        .supervision()
        .identifiantDashboardSupervision();

      const { filtreDate, filtreBesoinsSecurite, filtreEntite } = filtres;

      const filtreDateMetabase = filtreDate
        ? correspondancesFiltreDate[filtreDate]
        : undefined;

      const idSuperviseurHash = hache(idSuperviseur);
      const filtreEntiteHache = filtreEntite ? hache(filtreEntite) : undefined;

      const donnees = {
        resource: { dashboard: idDashboardSupervision },
        params: {
          id_superviseur: [idSuperviseurHash],
          besoins_de_securite: filtreBesoinsSecurite || [],
          siret: filtreEntiteHache || [],
          date: filtreDateMetabase || [],
        },
        exp: Math.round(Date.now() / 1000) + 10 * 60,
      };

      const jeton = sign(donnees, cleSecreteIntegration);
      return `${urlDeBase}embed/dashboard/${jeton}#bordered=false&titled=false`;
    },
    relieSuperviseursAService: async (service, idSuperviseurs) => {
      const idServiceHash = hache(service.id);
      const siretServiceHash = hache(service.siretDeOrganisation());
      const idSuperviseursHash = idSuperviseurs.map(hache);

      await knex('journal_mss.superviseurs')
        .insert(
          idSuperviseursHash.map((idSuperviseur) => ({
            id_superviseur: idSuperviseur,
            id_service: idServiceHash,
            siret_service: siretServiceHash,
          }))
        )
        .onConflict()
        .ignore();
    },
    revoqueSuperviseur: async (idSuperviseur) => {
      const idSuperviseurHash = hache(idSuperviseur);

      await knex('journal_mss.superviseurs')
        .where({ id_superviseur: idSuperviseurHash })
        .del();
    },
  };
};

module.exports = adaptateurSupervisionMetabase;
