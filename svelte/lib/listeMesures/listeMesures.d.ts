import type {
  IdNiveauDeSecurite,
  IdTypeService,
  MesureSpecifique,
  ReferentielStatut,
} from '../ui/types.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-liste-mesures': CustomEvent;
    'svelte-recharge-rapport-televersement-modeles-mesure-specifique': CustomEvent;
  }
}

export type ListeMesuresProps = {
  statuts: ReferentielStatut;
  categories: { id: string; label: string }[];
  typesService: ReferentielTypesService;
  afficheModelesMesureSpecifique: boolean;
  capaciteAjoutDeMesure: CapaciteAjoutDeMesure;
};

export type RapportTeleversementProps = {
  capaciteAjoutDeMesure: CapaciteAjoutDeMesure;
};

export type PersonnalisationMesure = {
  statut?: string;
  modalites?: string;
  id?: string;
  type?: 'generale' | 'specifique';
};

export type ServiceAvecMesuresAssociees = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  mesuresAssociees: Record<string, PersonnalisationMesure>;
  mesuresSpecifiques: MesureSpecifique[];
  peutEtreModifie: boolean;
  niveauSecurite: IdNiveauDeSecurite;
  typeService: IdTypeService[];
};

export type ServiceAssocieAUneMesure = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  mesure: PersonnalisationMesure;
  peutEtreModifie: boolean;
  niveauSecurite: IdNiveauDeSecurite;
  typeService: IdTypeService[];
};

export type ModeleDeMesure = {
  id: string;
  categorie: CategorieMesure;
  description: string;
  descriptionLongue: string;
  identifiantNumerique?: string;
  referentiel: Referentiel;
  idsServicesAssocies: string[];
  type: 'generale' | 'specifique';
};

export type CapaciteAjoutDeMesure = {
  nombreRestant: number;
  nombreMaximum: number;
};
