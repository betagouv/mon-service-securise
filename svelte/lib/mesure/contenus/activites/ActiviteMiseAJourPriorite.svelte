<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import TagPrioriteMesure from '../../../ui/TagPrioriteMesure.svelte';
  import type { PrioriteMesure, ReferentielPriorite } from '../../../ui/types';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  interface Props {
    activite: ActiviteMesure;
    priorites: ReferentielPriorite;
  }

  let { activite, priorites }: Props = $props();

  let details = $derived(activite.details as DetailsMiseAJourPropriete);
  let ancienneValeur: PrioriteMesure = $derived(
    details.ancienneValeur as PrioriteMesure
  );
  let nouvelleValeur: PrioriteMesure = $derived(
    details.nouvelleValeur as PrioriteMesure
  );
</script>

<div>
  <div>
    La priorité de la <DesignationMesureActivite {activite} /> a été modifiée
  </div>
  <div class="changements">
    de
    <TagPrioriteMesure {priorites} priorite={ancienneValeur} />
    à
    <TagPrioriteMesure {priorites} priorite={nouvelleValeur} />
  </div>
</div>

<style>
  .changements {
    margin-top: 4px;
  }
</style>
