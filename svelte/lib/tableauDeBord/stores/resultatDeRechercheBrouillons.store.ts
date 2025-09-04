import { derived } from 'svelte/store';
import { rechercheTextuelle } from './rechercheTextuelle.store';
import type { BrouillonService } from '../tableauDeBord.d';
import { brouillonsService } from './brouillonsService.store';

export const resultatsDeRechercheBrouillons = derived<
  [typeof brouillonsService, typeof rechercheTextuelle],
  BrouillonService[]
>(
  [brouillonsService, rechercheTextuelle],
  ([$brouillonsService, $rechercheTextuelle]) => {
    return $brouillonsService.filter((brouillon) =>
      brouillon.nomService
        .toLowerCase()
        .includes($rechercheTextuelle.toLowerCase())
    );
  }
);
