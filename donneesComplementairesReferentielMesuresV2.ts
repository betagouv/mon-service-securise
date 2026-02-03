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
  thematique:
    | 'Gouvernance et gestion des risques'
    | "Gestion de l'écosystème"
    | 'Sécurité applicative et protection des données'
    | 'Gestion des identités et des accès'
    | 'Surveillance, maintien et réponse aux incidents'
    | 'Protection des systèmes et réseaux';
};

export type DonneesComplementairesMesuresV2 = Record<
  IdMesureV2,
  DonneesComplementaireMesureV2
>;

export const donneesComplementairesMesureV2: DonneesComplementairesMesuresV2 = {
  'RECENSEMENT.1': {
    porteursSinguliers: ['Chef de projet numérique', 'Chef de projet métier'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RECENSEMENT.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RECENSEMENT.3': {
    porteursSinguliers: ['Chef de projet numérique', 'Chef de projet métier'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'CONFORMITE.1': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'CONFORMITE.3': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'PSSI.5': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'CONTRAT.1': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
    thematique: "Gestion de l'écosystème",
  },
  'CONTRAT.2': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
    thematique: "Gestion de l'écosystème",
  },
  'DEV.1': {
    porteursSinguliers: ['RSSI', 'Développeurs'],
    thematique: 'Sécurité applicative et protection des données',
  },
  'ECOSYSTEME.1': {
    porteursSinguliers: ['Chef de projet numérique'],
    thematique: "Gestion de l'écosystème",
  },
  'ECOSYSTEME.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: "Gestion de l'écosystème",
  },
  'ECOSYSTEME.3': {
    porteursSinguliers: ['Chef de projet numérique'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'ECOSYSTEME.4': {
    porteursSinguliers: ['Chef de projet numérique'],
    thematique: "Gestion de l'écosystème",
  },
  'ECOSYSTEME.5': {
    porteursSinguliers: ['Chef de projet numérique'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'ECOSYSTEME.6': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RH.2': {
    porteursSinguliers: ['Chef de projet numérique', 'RSSI'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RH.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'CARTO.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'DONNEES.1': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Sécurité applicative et protection des données',
  },
  'DONNEES.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
    thematique: 'Sécurité applicative et protection des données',
  },
  'MCO_MCS.1': {
    porteursSinguliers: ['Développeurs', 'Administrateur technique', 'RSSI'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'MCO_MCS.10': {
    porteursSinguliers: ['Chef de projet numérique', 'Chef de projet métier'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'MCO_MCS.11': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Sécurité applicative et protection des données',
  },
  'MCO_MCS.12': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Sécurité applicative et protection des données',
  },
  'MCO_MCS.14': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'MCO_MCS.15': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'MCO_MCS.16': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'MCO_MCS.17': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'MCO_MCS.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'RSSI',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'MCO_MCS.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'MCO_MCS.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'MCO_MCS.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'MCO_MCS.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'RGPD.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RGPD.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RGPD.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RGPD.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RGPD.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RGPD.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'DPO',
      'Chef de projet métier',
    ],
    thematique: 'Gouvernance et gestion des risques',
  },
  'PHYS.1': {
    porteursSinguliers: ['RSSI'],
    thematique: 'Gestion des identités et des accès',
  },
  'PHYS.2': {
    porteursSinguliers: ['RSSI'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CLOISON.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CLOISON.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CLOISON.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CLOISON.4': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CLOISON.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CLOISON.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'FILTRE.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'FILTRE.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'FILTRE.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'FILTRE.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'FILTRE.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Sécurité applicative et protection des données',
  },
  'FILTRE.6': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'FILTRE.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Sécurité applicative et protection des données',
  },
  'MAIL.1': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Sécurité applicative et protection des données',
  },
  'MAIL.2': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Sécurité applicative et protection des données',
  },
  'DISTANCE.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Sécurité applicative et protection des données',
  },
  'DISTANCE.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Sécurité applicative et protection des données',
  },
  'DISTANCE.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'DISTANCE.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'MALWARE.3': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Gestion des identités et des accès',
  },
  'MALWARE.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'RSSI',
      'Administrateur technique',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'MALWARE.5': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'MALWARE.6': {
    porteursSinguliers: ['RSSI', 'Administrateur technique'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'AUTH.1': {
    porteursSinguliers: ['Administrateur technique', 'Développeurs'],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.10': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.11': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.12': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.2': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur fonctionnel',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.3': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.4': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.5': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.6': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.7': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Gestion des identités et des accès',
  },
  'AUTH.8': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Sécurité applicative et protection des données',
  },
  'AUTH.9': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Gestion des identités et des accès',
  },
  'DROITS.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur fonctionnel',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'DROITS.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'DROITS.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'ID.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
      'Développeurs',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'ID.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'ID.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'ID.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur fonctionnel',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'ANNUAIRE.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ANNUAIRE.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ANNUAIRE.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ANNUAIRE.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'COMPADMIN.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'COMPADMIN.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'COMPADMIN.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'COMPADMIN.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'COMPADMIN.5': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'COMPADMIN.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'COMPADMIN.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'COMPADMIN.9': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Gestion des identités et des accès',
  },
  'INCIDENT.1': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique', 'Développeurs'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'INCIDENT.2': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'INCIDENT.3': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'INCIDENT.4': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'INCIDENT.6': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'INCIDENT.7': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'INCIDENT.8': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'CONTINU.1': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'CONTINU.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'CONTINU.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Chef de projet métier',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'CONTINU.5': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'CONTINU.6': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'RISQUE.1': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'RISQUE.2': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'AUDIT.1': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Gouvernance et gestion des risques',
  },
  'AUDIT.2': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'AUDIT.3': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'AUDIT.4': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'AUDIT.5': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'AUDIT.6': {
    porteursSinguliers: ['Chef de projet numérique', 'Développeurs'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'AUDIT.7': {
    porteursSinguliers: ['RSSI', 'Chef de projet numérique'],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CONFIG.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CONFIG.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CONFIG.3': {
    porteursSinguliers: [
      'RSSI',
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CONFIG.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CONFIG.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CONFIG.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CONFIG.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
      'Développeurs',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'CONFIG.8': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ADMIN.1': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ADMIN.2': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ADMIN.3': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ADMIN.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ADMIN.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ADMIN.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'ADMIN.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Administrateur technique',
    ],
    thematique: 'Protection des systèmes et réseaux',
  },
  'SUPERVISION.4': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'SUPERVISION.5': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'SUPERVISION.6': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
  'SUPERVISION.7': {
    porteursSinguliers: [
      'Chef de projet numérique',
      'Développeurs',
      'Administrateur technique',
    ],
    thematique: 'Surveillance, maintien et réponse aux incidents',
  },
};
