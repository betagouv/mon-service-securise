import { IdMesureV2 } from './donneesReferentielMesuresV2.js';

type DonneesComplementaireMesureV2 = {
  porteursSinguliers: Array<
    | 'Chef de projet numérique'
    | 'Chef de projet métier'
    | 'Administrateur technique'
    | 'RSSI'
    | 'Développeurs'
    | 'Administrateur fonctionnel'
    | 'DPO'
  >;
  thematique?: string;
};

export type DonneesComplementairesMesuresV2 = Record<
  IdMesureV2,
  DonneesComplementaireMesureV2
>;

export const donneesComplementairesMesureV2: DonneesComplementairesMesuresV2 = {
  'RECENSEMENT.1': {
    porteursSinguliers: ['Chef de projet numérique', 'Chef de projet métier'],
  },
  'RECENSEMENT.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'RECENSEMENT.3': {
    porteursSinguliers: ['Chef de projet numérique', 'Chef de projet métier'],
  },
  'CONFORMITE.1': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
  },
  'CONFORMITE.3': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
  },
  'PSSI.5': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
  },
  'CONTRAT.1': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
  },
  'CONTRAT.2': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
  },
  'DEV.1': {
    porteursSinguliers: ['RSSI', 'Développeurs'],
  },
  'ECOSYSTEME.1': {
    porteursSinguliers: ['Chef de projet numérique'],
  },
  'ECOSYSTEME.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ECOSYSTEME.3': {
    porteursSinguliers: ['Chef de projet numérique'],
  },
  'ECOSYSTEME.4': {
    porteursSinguliers: ['Chef de projet numérique'],
  },
  'ECOSYSTEME.5': {
    porteursSinguliers: ['Chef de projet numérique'],
  },
  'ECOSYSTEME.6': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
  },
  'RH.2': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
  },
  'RH.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
    ],
  },
  'CARTO.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'DONNEES.1': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'DONNEES.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
  },
  'MCO_MCS.1': {
    porteursSinguliers: ['Développeurs', 'Administrateur technique', 'RSSI'],
  },
  'MCO_MCS.10': {
    porteursSinguliers: ['Chef de projet numérique', 'Chef de projet métier'],
  },
  'MCO_MCS.11': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'MCO_MCS.12': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'MCO_MCS.14': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'MCO_MCS.15': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MCO_MCS.16': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MCO_MCS.17': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MCO_MCS.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'RSSI',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MCO_MCS.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MCO_MCS.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MCO_MCS.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MCO_MCS.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'RGPD.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
  },
  'RGPD.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
  },
  'RGPD.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
  },
  'RGPD.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
  },
  'RGPD.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
  },
  'RGPD.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
  },
  'PHYS.1': {
    porteursSinguliers: ['RSSI'],
  },
  'PHYS.2': {
    porteursSinguliers: ['RSSI'],
  },
  'CLOISON.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CLOISON.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CLOISON.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CLOISON.4': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CLOISON.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CLOISON.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'FILTRE.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'FILTRE.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'FILTRE.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'FILTRE.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'FILTRE.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'FILTRE.6': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'FILTRE.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MAIL.1': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'MAIL.2': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'DISTANCE.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'DISTANCE.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'DISTANCE.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'DISTANCE.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'MALWARE.3': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'MALWARE.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'RSSI',
      'Administrateur technique',
    ],
  },
  'MALWARE.5': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'MALWARE.6': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
  },
  'AUTH.1': {
    porteursSinguliers: ['Administrateur technique', 'Développeurs'],
  },
  'AUTH.10': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'AUTH.11': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'AUTH.12': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'AUTH.2': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur fonctionnel',
    ],
  },
  'AUTH.3': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'AUTH.4': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'AUTH.5': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'AUTH.6': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'AUTH.7': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'AUTH.8': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'AUTH.9': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'DROITS.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur fonctionnel',
    ],
  },
  'DROITS.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
  },
  'DROITS.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
      'Administrateur technique',
    ],
  },
  'ID.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
      'Développeurs',
    ],
  },
  'ID.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
      'Administrateur technique',
    ],
  },
  'ID.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ID.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
    ],
  },
  'ANNUAIRE.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ANNUAIRE.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ANNUAIRE.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ANNUAIRE.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'COMPADMIN.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'COMPADMIN.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'COMPADMIN.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'COMPADMIN.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'COMPADMIN.5': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'COMPADMIN.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'COMPADMIN.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'COMPADMIN.9': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'INCIDENT.1': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique', 'Développeurs'],
  },
  'INCIDENT.2': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'INCIDENT.3': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'INCIDENT.4': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'INCIDENT.6': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'INCIDENT.7': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'INCIDENT.8': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'CONTINU.1': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'CONTINU.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'CONTINU.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Chef de projet métier',
    ],
  },
  'CONTINU.5': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'CONTINU.6': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'RISQUE.1': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'RISQUE.2': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'AUDIT.1': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'AUDIT.2': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'AUDIT.3': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'AUDIT.4': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'AUDIT.5': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'AUDIT.6': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
  },
  'AUDIT.7': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
  },
  'CONFIG.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'CONFIG.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CONFIG.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CONFIG.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'CONFIG.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CONFIG.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'CONFIG.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
  },
  'CONFIG.8': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ADMIN.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ADMIN.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ADMIN.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ADMIN.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ADMIN.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ADMIN.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'ADMIN.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
  },
  'SUPERVISION.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
  },
  'SUPERVISION.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
  },
  'SUPERVISION.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
  },
  'SUPERVISION.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
  },
};
