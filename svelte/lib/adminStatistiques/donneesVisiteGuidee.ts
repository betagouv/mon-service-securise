import type { Statistiques } from './adminStatistiques.types';
import type { EntiteSupervisee } from '../adminEntites/adminEntites.types';

const statistiques: Statistiques = {
  servicesParType: {
    api: 6,
  },
  servicesParNiveauSecurite: {
    niveau2: 3,
    niveau3: 7,
  },
  evolutionNombreServices: [
    {
      mois: '2026-04',
      total: 1,
    },
    {
      mois: '2026-05',
      total: 1,
    },
    {
      mois: '2026-06',
      total: 2,
    },
    {
      mois: '2026-07',
      total: 2,
    },
    {
      mois: '2026-08',
      total: 3,
    },
  ],
  evolutionNombreOrganisations: [
    {
      mois: '2026-04',
      total: 1,
    },
    {
      mois: '2026-05',
      total: 1,
    },
    {
      mois: '2026-06',
      total: 1,
    },
    {
      mois: '2026-07',
      total: 1,
    },
    {
      mois: '2026-08',
      total: 2,
    },
  ],
  indiceCyberMoyen: 0.7721520219040785,
  servicesParTrancheIndiceCyber: {
    '< 1': 8,
    '< 2': 0,
    '< 3': 1,
    '< 4': 0,
    '≥ 4': 1,
  },
  nombreServicesHomologues: 1,
  evolutionNombreHomologations: [
    {
      mois: '2025-12',
      total: 1,
    },
    {
      mois: '2026-01',
      total: 1,
    },
    {
      mois: '2026-02',
      total: 1,
    },
    {
      mois: '2026-03',
      total: 1,
    },
    {
      mois: '2026-04',
      total: 1,
    },
    {
      mois: '2026-05',
      total: 1,
    },
    {
      mois: '2026-06',
      total: 1,
    },
    {
      mois: '2026-07',
      total: 1,
    },
    {
      mois: '2026-08',
      total: 2,
    },
  ],
  servicesParTrancheExpirationHomologation: {
    expire: 1,
    '< 6': 1,
    '< 12': 0,
    '< 24': 0,
    '< 36': 0,
  },
  nombreServicesCompletudeSuperieur80: 1,
  servicesParTrancheCompletudeMesures: {
    '< 25%': 8,
    '< 50%': 0,
    '< 75%': 1,
    '≤ 100%': 1,
  },
  nombreMesuresParStatutEtCategorie: {
    gouvernance: {
      fait: 51,
      enCours: 0,
      nonFait: 0,
      aLancer: 0,
    },
    protection: {
      fait: 73,
      enCours: 1,
      nonFait: 0,
      aLancer: 0,
    },
    defense: {
      fait: 7,
      enCours: 0,
      nonFait: 0,
      aLancer: 3,
    },
    resilience: {
      fait: 6,
      enCours: 0,
      nonFait: 0,
      aLancer: 0,
    },
  },
  servicesParTrancheDateDerniereModification: {
    '< 1 mois': 6,
    '< 6 mois': 0,
    '< 1 an': 0,
    '≥ 1 an': 0,
  },
};
const entites: Array<EntiteSupervisee> = [
  {
    administrateurs: [],
    nombreServices: 12,
    nombreUtilisateurs: 47,
    siret: '1234',
    nom: 'Nom',
    departement: '75',
  },
];

export const donneesVisiteGuidee = {
  statistiques,
  entites,
};
