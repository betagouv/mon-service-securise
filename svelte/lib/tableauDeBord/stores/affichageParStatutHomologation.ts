import { derived, writable } from 'svelte/store';
import { resultatsDeRecherche } from './resultatDeRecherche.store';
import type { ServiceAvecIndiceCyber } from '../tableauDeBord.d';

export type StatutHomologation =
  | 'bientotExpiree'
  | 'enCoursEdition'
  | 'expiree'
  | 'tous';

type ServicesParStatutHomologation = {
  tous: ServiceAvecIndiceCyber[];
  bientotExpiree: ServiceAvecIndiceCyber[];
  expiree: ServiceAvecIndiceCyber[];
  enCoursEdition: ServiceAvecIndiceCyber[];
};

export const affichageParStatutHomologationSelectionne =
  writable<StatutHomologation>('tous');

export const affichageParStatutHomologation = derived<
  [typeof resultatsDeRecherche],
  ServicesParStatutHomologation
>([resultatsDeRecherche], ([$resultatsDeRecherche]) => ({
  tous: $resultatsDeRecherche,
  bientotExpiree: $resultatsDeRecherche.filter(
    (s) => s.statutHomologation?.id === 'bientotExpiree'
  ),
  expiree: $resultatsDeRecherche.filter(
    (s) => s.statutHomologation?.id === 'expiree'
  ),
  enCoursEdition: $resultatsDeRecherche.filter(
    (s) => s.statutHomologation?.enCoursEdition
  ),
}));

export const resultatsDeRechercheDuStatutHomologationSelectionne = derived<
  [
    typeof affichageParStatutHomologation,
    typeof affichageParStatutHomologationSelectionne,
  ],
  ServiceAvecIndiceCyber[]
>(
  [affichageParStatutHomologation, affichageParStatutHomologationSelectionne],
  ([
    $affichageParStatutHomologation,
    $affichageParStatutHomologationSelectionne,
  ]) =>
    $affichageParStatutHomologation[$affichageParStatutHomologationSelectionne]
);
