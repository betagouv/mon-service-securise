import Knex from 'knex';
import { journalMSS } from './adaptateurEnvironnement.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';

const adaptateurSupervisionMetabase = ({
  adaptateurChiffrement,
}: {
  adaptateurChiffrement: AdaptateurChiffrement;
}) => {
  const config = {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
    pool: { min: 0, max: journalMSS().poolMaximumConnexion() },
  };

  const knex = Knex(config);

  const hache = (id: string) => adaptateurChiffrement.hacheSha256(id);

  return {
    delieServiceDesSuperviseurs: async (idService: UUID) => {
      const idServiceHash = hache(idService);
      await knex('journal_mss.superviseurs')
        .where('id_service', idServiceHash)
        .del();
    },
    relieSuperviseursAService: async (
      service: Service,
      idSuperviseurs: Array<UUID>
    ) => {
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
    revoqueSuperviseur: async (idSuperviseur: UUID) => {
      const idSuperviseurHash = hache(idSuperviseur);

      await knex('journal_mss.superviseurs')
        .where({ id_superviseur: idSuperviseurHash })
        .del();
    },
  };
};

export default adaptateurSupervisionMetabase;
