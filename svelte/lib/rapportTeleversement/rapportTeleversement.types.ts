export type ErreurService =
  | 'NOM_INVALIDE'
  | 'NOM_EXISTANT'
  | 'SIRET_INVALIDE'
  | 'NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE'
  | 'TYPE_INVALIDE'
  | 'PROVENANCE_INVALIDE'
  | 'STATUT_INVALIDE'
  | 'LOCALISATION_INVALIDE'
  | 'DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE'
  | 'DOSSIER_HOMOLOGATION_INCOMPLET'
  | 'DATE_HOMOLOGATION_INVALIDE'
  | 'DUREE_HOMOLOGATION_INVALIDE';

export type RapportService = {
  service: {
    dateHomologation: string;
    delaiAvantImpactCritique: string;
    dureeHomologation: string;
    fonctionAutoriteHomologation: string;
    localisation: string;
    nom: string;
    nomAutoriteHomologation: string;
    nombreOrganisationsUtilisatrices: string;
    provenance: string;
    siret: string;
    statut: string;
    type: string;
  };
  erreurs: ErreurService[];
};

export type RapportDetaille = {
  statut: 'VALIDE' | 'INVALIDE';
  services: RapportService[];
};

export const MessagesErreur: Record<ErreurService, string> = {
  NOM_INVALIDE: 'Le nom est manquant',
  NOM_EXISTANT: 'Le nom est déjà utilisé',
  NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE:
    "Le nombre d'organisation(s) utilisatrice(s) est invalide",
  SIRET_INVALIDE: 'Le SIRET est invalide',
  TYPE_INVALIDE: 'Le type est invalide',
  PROVENANCE_INVALIDE: 'La provenance est invalide',
  STATUT_INVALIDE: 'Le statut est invalide',
  LOCALISATION_INVALIDE: 'La localisation est invalide',
  DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE:
    'La durée maximale de dysfonctionnement est invalide',
  DOSSIER_HOMOLOGATION_INCOMPLET: "Le dossier d'homologation est incomplet",
  DATE_HOMOLOGATION_INVALIDE: "La date d'homologation est invalide",
  DUREE_HOMOLOGATION_INVALIDE: "La durée d'homologation est invalide",
};
