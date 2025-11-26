import donneesReferentielV1 from './donneesReferentiel.js';
import { IdMesureV2 } from './donneesReferentielMesuresV2.js';

export type IdMesureV1 = keyof (typeof donneesReferentielV1)['mesures'];

export type EquivalencesMesuresV1V2 = Record<
  IdMesureV1,
  | {
      idsMesureV2: IdMesureV2[];
      statut: 'modifiee';
      conservationDonnees: boolean;
    }
  | {
      idsMesureV2: IdMesureV2[];
      statut: 'inchangee';
      conservationDonnees: true;
    }
  | {
      idsMesureV2: IdMesureV2[];
      statut: 'supprimee';
      conservationDonnees: false;
    }
>;

// Voir scripts/moteurRegles/transformeLienV1V2EnJSON.sh pour générer ce JSON à partir du CSV Grist.
export const conversionMesuresV1versV2: EquivalencesMesuresV1V2 = {
  exigencesSecurite: {
    idsMesureV2: ['CONTRAT.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  identificationDonneesSensibles: {
    idsMesureV2: ['RECENSEMENT.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  listeEquipements: {
    idsMesureV2: ['RECENSEMENT.2'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  limitationInterconnexions: {
    idsMesureV2: ['FILTRE.1', 'FILTRE.2'],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  listeComptesPrivilegies: {
    idsMesureV2: ['COMPADMIN.4'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  hebergementUE: {
    idsMesureV2: ['ECOSYSTEME.3'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  secNumCloud: {
    idsMesureV2: ['ECOSYSTEME.4'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  analyseRisques: {
    idsMesureV2: ['RISQUE.1', 'RISQUE.2'],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  audit: {
    idsMesureV2: ['AUDIT.7'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  testIntrusion: {
    idsMesureV2: ['AUDIT.3'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  auditsSecurite: {
    idsMesureV2: ['AUDIT.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  verificationAutomatique: {
    idsMesureV2: ['CONFIG.3'],
    statut: 'modifiee',
    conservationDonnees: false,
  },
  contactSecurite: {
    idsMesureV2: ['INCIDENT.6'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  certificatChiffrement: {
    idsMesureV2: ['CONFIG.4'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  chiffrementFlux: {
    idsMesureV2: ['CONFIG.5'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  portsOuverts: {
    idsMesureV2: ['CONFIG.6'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  certificatSignature: {
    idsMesureV2: ['CONFIG.7'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  limitationAccesAdmin: {
    idsMesureV2: ['COMPADMIN.9'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  limitationDroitsAdmin: {
    idsMesureV2: ['COMPADMIN.6'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  compartimenter: {
    idsMesureV2: ['COMPADMIN.3'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  dissocierComptesAdmin: {
    idsMesureV2: ['COMPADMIN.2'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  differentiationFiltrage: {
    idsMesureV2: ['ADMIN.6'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  limitationCreationComptes: {
    idsMesureV2: ['ID.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  gestionComptesAcces: {
    idsMesureV2: ['ID.2'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  contraintesMotDePasse: {
    idsMesureV2: ['AUTH.4', 'AUTH.7'],
    statut: 'modifiee',
    conservationDonnees: true,
  },
  doubleAuthentAdmins: {
    idsMesureV2: ['DISTANCE.2'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  coffreFort: {
    idsMesureV2: ['AUTH.12'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  protectionMotsDePasse: {
    idsMesureV2: ['AUTH.11'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  deconnexionAutomatique: {
    idsMesureV2: ['AUTH.8'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  environnementSecurise: {
    idsMesureV2: ['ADMIN.1', 'ADMIN.2', 'ADMIN.3', 'ADMIN.4', 'ADMIN.5'],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  versionRecente: {
    idsMesureV2: ['MCO_MCS.5'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  misesAJour: {
    idsMesureV2: [
      'MCO_MCS.4',
      'MCO_MCS.14',
      'MCO_MCS.15',
      'MCO_MCS.16',
      'MCO_MCS.17',
    ],
    statut: 'modifiee',
    conservationDonnees: false,
  },
  securisationCode: {
    idsMesureV2: ['DEV.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  hebergementMachineVirtuelle: {
    idsMesureV2: [],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  chiffrementMachineVirtuelle: {
    idsMesureV2: ['DONNEES.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  telechargementsOfficiels: {
    idsMesureV2: ['MCO_MCS.10'],
    statut: 'modifiee',
    conservationDonnees: false,
  },
  configurationMinimaliste: {
    idsMesureV2: ['CONFIG.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  moindrePrivilege: {
    idsMesureV2: ['DROITS.2'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  nomsDomaineFrUe: {
    idsMesureV2: ['ECOSYSTEME.5'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  nomsDomaineSimilaires: {
    idsMesureV2: ['ECOSYSTEME.6'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  anonymisationDonnees: {
    idsMesureV2: ['DONNEES.2'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  protectionDeniService: {
    idsMesureV2: ['FILTRE.4'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  gestionIncidents: {
    idsMesureV2: ['INCIDENT.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  testsProcedures: {
    idsMesureV2: [],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  notificationConnexionsSuspectes: {
    idsMesureV2: [],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  journalAcces: {
    idsMesureV2: ['SUPERVISION.6'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  journalEvenementSecu: {
    idsMesureV2: ['SUPERVISION.7'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  veilleSecurite: {
    idsMesureV2: ['MCO_MCS.3'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  supervision: {
    idsMesureV2: [],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  sauvegardeMachineVirtuelle: {
    idsMesureV2: ['CONTINU.1'],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  sauvegardeDonnees: {
    idsMesureV2: ['CONTINU.1'],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  testsSauvegardes: {
    idsMesureV2: ['CONTINU.1'],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  garantieHauteDisponibilite: {
    idsMesureV2: ['CONTINU.6'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  exerciceGestionCrise: {
    idsMesureV2: [],
    statut: 'supprimee',
    conservationDonnees: false,
  },
  registreTraitements: {
    idsMesureV2: ['RGPD.1'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  minimisationCollecteDonnees: {
    idsMesureV2: ['RGPD.2'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  dureeLimiteeConservationDonnees: {
    idsMesureV2: ['RGPD.3'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  utilisationDonneesCaracterePersonnel: {
    idsMesureV2: ['RGPD.4'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  modalitesExerciceDroits: {
    idsMesureV2: ['RGPD.5'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  analyseProtectionDonnees: {
    idsMesureV2: ['RGPD.6'],
    statut: 'inchangee',
    conservationDonnees: true,
  },
  consignesSecurite: {
    idsMesureV2: ['RH.2'],
    statut: 'modifiee',
    conservationDonnees: false,
  },
  renouvellementMotsDePasse: {
    idsMesureV2: [],
    statut: 'supprimee',
    conservationDonnees: false,
  },
};
