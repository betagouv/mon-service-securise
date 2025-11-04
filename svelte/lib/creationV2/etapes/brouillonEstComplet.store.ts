import { derived } from 'svelte/store';
import { leBrouillon } from './brouillon.store';
import type { DescriptionServiceV2 } from '../creationV2.types';

export const donneesDeServiceSontCompletes = (d: DescriptionServiceV2) =>
  d.nomService.length > 0 &&
  /^\d{14}$/.test(d.siret) &&
  (!d.presentation || d.presentation.length <= 2000) &&
  (d.pointsAcces.length === 0 || d.pointsAcces.every((p) => p.length <= 200)) &&
  d.statutDeploiement.length > 0 &&
  d.typeService.length > 0 &&
  d.typeHebergement.length > 0 &&
  d.ouvertureSysteme.length > 0 &&
  d.audienceCible.length > 0 &&
  d.dureeDysfonctionnementAcceptable.length > 0 &&
  d.volumetrieDonneesTraitees.length > 0 &&
  (d.categoriesDonneesTraiteesSupplementaires.length === 0 ||
    d.categoriesDonneesTraiteesSupplementaires.every((p) => p.length <= 200)) &&
  d.localisationDonneesTraitees.length > 0;

export const brouillonEstCompletStore = derived<[typeof leBrouillon], boolean>(
  [leBrouillon],
  ([$b]) => !!$b.id && donneesDeServiceSontCompletes($b)
);
