const Knex = require('knex');

const adaptateurSupervision = ({ adaptateurChiffrement }) => {
  const config = {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
    pool: { min: 0, max: 10 },
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
    relieSuperviseursAService: async (service, idSuperviseurs) => {
      const idServiceHash = hache(service.id);
      const siretServiceHash = hache(service.siretDeOrganisation());
      const idSuperviseursHash = idSuperviseurs.map(hache);

      await knex('journal_mss.superviseurs').insert(
        idSuperviseursHash.map((idSuperviseur) => ({
          id_superviseur: idSuperviseur,
          id_service: idServiceHash,
          siret_service: siretServiceHash,
        }))
      );
    },
  };
};

module.exports = adaptateurSupervision;
