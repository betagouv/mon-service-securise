import type {
  IdNiveauDeSecurite,
  IdTypeService,
  ModeleMesureGenerale,
  MesureSpecifique,
  ReferentielStatut,
} from '../ui/types.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-liste-mesures': CustomEvent;
  }
}

export type ListeMesuresProps = {
  statuts: ReferentielStatut;
  typesService: ReferentielTypesService;
  afficheModelesMesureSpecifique: boolean;
};

export type PersonnalisationMesure = {
  statut?: string;
  modalites?: string;
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
