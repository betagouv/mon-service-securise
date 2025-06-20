import type { MesureReferentiel } from '../ui/types';

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
};
