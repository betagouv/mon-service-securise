import { derived } from 'svelte/store';
import { rechercheTextuelle } from './rechercheTextuelle.store';
import type { BrouillonService } from '../tableauDeBord.d';
import { brouillonsService } from './brouillonsService.store';
import { filtrageServices } from './filtrageServices.store';
import { affichageParStatutHomologationSelectionne } from './affichageParStatutHomologation';

export const resultatsDeRechercheBrouillons = derived<
  [
    typeof brouillonsService,
    typeof rechercheTextuelle,
    typeof filtrageServices,
    typeof affichageParStatutHomologationSelectionne,
  ],
  BrouillonService[]
>(
  [
    brouillonsService,
    rechercheTextuelle,
    filtrageServices,
    affichageParStatutHomologationSelectionne,
  ],
  ([
    $brouillonsService,
    $rechercheTextuelle,
    $filtrageServices,
    $affichageParStatutHomologationSelectionne,
  ]) => {
    if (
      $filtrageServices.indiceCyber.length > 0 ||
      $filtrageServices.propriete.length > 0 ||
      $filtrageServices.niveauSecurite.length > 0 ||
      $filtrageServices.completude.length > 0 ||
      $affichageParStatutHomologationSelectionne !== 'tous'
    )
      return [];
    return $brouillonsService.filter((brouillon) =>
      brouillon.nomService
        .toLowerCase()
        .includes($rechercheTextuelle.toLowerCase())
    );
  }
);
