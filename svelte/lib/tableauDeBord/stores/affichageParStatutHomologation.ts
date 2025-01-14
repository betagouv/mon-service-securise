import { derived, writable } from 'svelte/store';
import { resultatsDeRecherche } from './resultatDeRecherche.store';
import type { Service } from '../tableauDeBord.d';

export type StatutHomologation =
  | 'bientotExpiree'
  | 'enCoursEdition'
  | 'expiree'
  | 'tous';

type ServicesParStatutHomologation = {
  tous: Service[];
  bientotExpiree: Service[];
  expiree: Service[];
  enCoursEdition: Service[];
};

export const affichageParStatutHomologationSelectionne =
  writable<StatutHomologation>('tous');

export const affichageParStatutHomologation = derived<
  [typeof resultatsDeRecherche],
  ServicesParStatutHomologation
>([resultatsDeRecherche], ([$resultatsDeRecherche]) => ({
  tous: $resultatsDeRecherche,
  bientotExpiree: $resultatsDeRecherche.filter(
    (s) => s.statutHomologation.id === 'bientotExpiree'
  ),
  expiree: $resultatsDeRecherche.filter(
    (s) => s.statutHomologation.id === 'expiree'
  ),
  enCoursEdition: $resultatsDeRecherche.filter(
    (s) => s.statutHomologation.enCoursEdition
  ),
}));

export const resultatsDeRechercheDuStatutHomologationSelectionne = derived<
  [
    typeof affichageParStatutHomologation,
    typeof affichageParStatutHomologationSelectionne,
  ],
  Service[]
>(
  [affichageParStatutHomologation, affichageParStatutHomologationSelectionne],
  ([
    $affichageParStatutHomologation,
    $affichageParStatutHomologationSelectionne,
  ]) =>
    $affichageParStatutHomologation[$affichageParStatutHomologationSelectionne]
);
