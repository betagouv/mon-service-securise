export type ErreurServiceV2 =
  | 'NOM_INVALIDE'
  | 'NOM_EXISTANT'
  | 'SIRET_INVALIDE'
  | 'STATUT_DEPLOIEMENT_INVALIDE'
  | 'TYPE_INVALIDE'
  | 'TYPE_HEBERGEMENT_INVALIDE'
  | 'OUVERTURE_SYSTEME_INVALIDE'
  | 'AUDIENCE_CIBLE_INVALIDE'
  | 'VOLUMETRIE_DONNEES_TRAITEES_INVALIDE'
  | 'LOCALISATION_INVALIDE'
  | 'DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE'
  | 'DOSSIER_HOMOLOGATION_INCOMPLET'
  | 'DATE_HOMOLOGATION_INVALIDE'
  | 'DUREE_HOMOLOGATION_INVALIDE';

export type RapportServiceV2 = {
  service: {
    audienceCible: string;
    dateHomologation: string;
    dureeDysfonctionnementAcceptable: string;
    dureeHomologation: string;
    fonctionAutoriteHomologation: string;
    localisationDonneesTraitees: string;
    nom: string;
    nomAutoriteHomologation: string;
    ouvertureSysteme: string;
    siret: string;
    statutDeploiement: string;
    typeHebergement: string;
    typeService: string[];
    volumetrieDonneesTraitees: string;
  };
  erreurs: ErreurServiceV2[];
  numeroLigne: number;
};

export type RapportDetailleV2 = {
  statut: 'VALIDE' | 'INVALIDE';
  services: RapportServiceV2[];
};

export const MessagesErreurV2: Record<ErreurServiceV2, string> = {
  AUDIENCE_CIBLE_INVALIDE: "L'audience cible est invalide",
  DATE_HOMOLOGATION_INVALIDE: "La date d'homologation est invalide",
  DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE:
    'La durée maximale acceptable de dysfonctionnement est invalide',
  DOSSIER_HOMOLOGATION_INCOMPLET: "Le dossier d'homologation est incomplet",
  DUREE_HOMOLOGATION_INVALIDE: "La durée d'homologation est invalide",
  LOCALISATION_INVALIDE: 'La localisation est invalide',
  NOM_EXISTANT: 'Le nom est déjà utilisé',
  NOM_INVALIDE: 'Le nom est manquant',
  OUVERTURE_SYSTEME_INVALIDE: "L'ouverture du système est invalide",
  SIRET_INVALIDE: 'Le SIRET est invalide',
  STATUT_DEPLOIEMENT_INVALIDE: 'Le statut est invalide',
  TYPE_HEBERGEMENT_INVALIDE: "Le type d'hébergement est invalide",
  TYPE_INVALIDE: 'Le type est invalide',
  VOLUMETRIE_DONNEES_TRAITEES_INVALIDE:
    'Le volume des données traitées est invalide',
};
