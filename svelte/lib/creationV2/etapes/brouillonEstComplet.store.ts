import { derived } from 'svelte/store';
import { leBrouillon } from './brouillon.store';

export const brouillonEstCompletStore = derived<[typeof leBrouillon], boolean>(
  [leBrouillon],
  ([$b]) =>
    !!$b.id &&
    $b.nomService.length > 0 &&
    /^\d{14}$/.test($b.siret) &&
    (!$b.presentation || $b.presentation.length <= 2000) &&
    $b.statutDeploiement.length > 0 &&
    $b.typeService.length > 0 &&
    $b.typeHebergement.length > 0 &&
    $b.ouvertureSysteme.length > 0 &&
    $b.audienceCible.length > 0 &&
    $b.dureeDysfonctionnementAcceptable.length > 0 &&
    $b.volumetrieDonneesTraitees.length > 0 &&
    $b.localisationDonneesTraitees.length > 0
);
