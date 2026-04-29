import type { ServiceComplet, ServicePourPagesService } from './pagesService.d';
import type { VersionService } from '../../../src/modeles/versionService';

const service: ServicePourPagesService = {
  id: 'ID-SERVICE-VISITE-GUIDEE',
  version: 'v2' as VersionService,
  nomService: 'Nom de mon service',
  organisationResponsable: 'Nom de mon entité',
  documentsPdfDisponibles: ['annexes', 'syntheseSecurite'],
};

const serviceComplet: ServiceComplet = {
  descriptionService: {
    activitesExternalisees: ['developpementLogiciel'],
    audienceCible: 'moyenne',
    categoriesDonneesTraiteesSupplementaires: [],
    dureeDysfonctionnementAcceptable: 'moinsDe4h',
    localisationDonneesTraitees: 'UE',
    ouvertureSysteme: 'accessibleSurInternet',
    pointsAcces: [],
    specificitesProjet: ['accesPhysiqueAuxBureaux'],
    typeHebergement: 'cloud',
    typeService: ['api'],
    nomService: 'Service A',
    categoriesDonneesTraitees: ['donneesSensibles'],
    volumetrieDonneesTraitees: 'moyen',
    statutDeploiement: 'enCours',
    presentation: 'Le service A …',
    niveauSecurite: 'niveau3',
    organisationResponsable: {
      nom: 'Mon organisation',
      siret: '12345',
      departement: '75',
    },
  },
  dossiers: {
    dossierCourant: undefined,
    dossiersPasses: [],
    aucunDossier: true,
    dossiersRefuses: [],
    dossierActif: undefined,
  },
  risques: {
    risquesGeneraux: [],
    risquesSpecifiques: [],
  },
  indicesCyber: {
    indiceCyberAnssi: {
      total: 4.6,
      gouvernance: 3,
      defense: 3,
      protection: 3,
      resilience: 3,
    },
    indiceCyberPersonnalise: {
      total: 4.6,
      gouvernance: 3,
      defense: 3,
      protection: 3,
      resilience: 3,
    },
    nombreMesuresNonFait: 0,
    nombreMesuresSpecifiques: 0,
    referentielsMesureConcernes: 'ANSSI',
    tranches: {
      indiceCyber: {
        valeurs: {
          borneInferieure: 0,
          borneSuperieure: 1,
          recommandationANSSI:
            "L'homologation du service est déconseillée ou devrait être limitée à <b>6 mois</b>.",
          recommandationANSSIComplement:
            "L'ANSSI recommande de renforcer la sécurité du service numérique avant de procéder à son homologation.",
          deconseillee: true,
          dureeHomologationConseillee: '6 mois',
          conseilHomologation: 'Homologation déconseillée',
          description: "Très insuffisant lorsqu'il est < 1",
        },
        descriptions: [],
      },
      indiceCyberPersonnalise: {
        valeurs: {
          borneInferieure: 0,
          borneSuperieure: 1,
          recommandationANSSI:
            "L'homologation du service est déconseillée ou devrait être limitée à <b>6 mois</b>.",
          recommandationANSSIComplement:
            "L'ANSSI recommande de renforcer la sécurité du service numérique avant de procéder à son homologation.",
          deconseillee: true,
          dureeHomologationConseillee: '6 mois',
          conseilHomologation: 'Homologation déconseillée',
          description: "Très insuffisant lorsqu'il est < 1",
        },
        descriptions: [],
      },
    },
  },
  contactsUtiles: {
    autoriteHomologation: { nom: 'Nom', fonction: 'Fonction' },
    acteursHomologation: [],
    partiesPrenantesSpecifiques: [],
    expertCybersecurite: { nom: 'Nom', fonction: 'Fonction' },
    partiesPrenantes: {
      Hebergement: {
        nom: 'Nom',
        pointContact: 'Contact',
        natureAcces: 'Acces',
      },
      MaintenanceService: {
        nom: 'Nom',
        pointContact: 'Contact',
        natureAcces: 'Acces',
      },
      SecuriteService: {
        nom: 'Nom',
        pointContact: 'Contact',
        natureAcces: 'Acces',
      },
      DeveloppementFourniture: {
        nom: 'Nom',
        pointContact: 'Contact',
        natureAcces: 'Acces',
      },
    },
    delegueProtectionDonnees: { nom: 'Nom', fonction: 'Fonction' },
    piloteProjet: { nom: 'Nom', fonction: 'Fonction' },
  },
};

export const donneesVisiteGuidee = { service, serviceComplet };
