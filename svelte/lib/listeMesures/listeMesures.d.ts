import type {
  IdNiveauDeSecurite,
  MesureReferentiel,
  IdTypeService,
  ReferentielStatut,
} from '../ui/types.d';
import type { StatutMesure } from '../modeles/modeleMesure';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-liste-mesures': CustomEvent;
  }
}

export type ListeMesuresProps = {
  statuts: ReferentielStatut;
  typesService: ReferentielTypesService;
};
export type ReferentielMesures = Record<string, MesureReferentiel>;

export type PersonnalisationMesure = {
  statut?: string;
  modalites?: string;
};

export type ServiceAvecMesuresAssociees = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  mesuresAssociees: Record<string, PersonnalisationMesure>;
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
