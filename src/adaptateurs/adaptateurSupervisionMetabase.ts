import Knex from 'knex';
import jwt from 'jsonwebtoken';
import { journalMSS } from './adaptateurEnvironnement.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { AdaptateurEnvironnement } from './adaptateurEnvironnement.interface.js';
import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';

const correspondancesFiltreDate = {
  aujourdhui: 'thisday',
  hier: 'past1days',
  septDerniersJours: 'past7days',
  trenteDerniersJours: 'past30days',
  unDernierMois: 'past1months',
  troisDerniersMois: 'past3months',
  douzeDerniersMois: 'past12months',
} as const;

type FiltreDate = keyof typeof correspondancesFiltreDate;

export type FiltresSupervision = {
  filtreDate?: FiltreDate;
  filtreBesoinsSecurite?: string;
  filtreEntite?: string;
};

const adaptateurSupervisionMetabase = ({
  adaptateurChiffrement,
  adaptateurEnvironnement,
}: {
  adaptateurChiffrement: AdaptateurChiffrement;
  adaptateurEnvironnement: AdaptateurEnvironnement;
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
    genereURLSupervision: (
      idSuperviseur: UUID,
      filtres: FiltresSupervision
    ) => {
      const urlDeBase = adaptateurEnvironnement
        .supervision()
        .domaineMetabaseMSS();
      const cleSecreteIntegration = adaptateurEnvironnement
        .supervision()
        .cleSecreteIntegrationMetabase() as string;
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

      const jeton = jwt.sign(donnees, cleSecreteIntegration);
      return `${urlDeBase}embed/dashboard/${jeton}#bordered=false&titled=false`;
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
