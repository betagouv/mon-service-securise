import type { MesureReferentiel } from '../ui/types';
import type { StatutMesure } from '../modeles/modeleMesure';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-liste-mesures': CustomEvent;
  }
}

export type ListeMesuresProps = {
  statuts: ReferentielStatut;
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
};

export type ServiceAssocieAUneMesure = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  mesure: PersonnalisationMesure;
  peutEtreModifie: boolean;
};
