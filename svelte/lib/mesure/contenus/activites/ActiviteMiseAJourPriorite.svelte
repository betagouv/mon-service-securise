<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import TagPrioriteMesure from '../../../ui/TagPrioriteMesure.svelte';
  import type { PrioriteMesure, ReferentielPriorite } from '../../../ui/types';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  export let activite: ActiviteMesure;
  export let priorites: ReferentielPriorite;
  // eslint-disable-next-line svelte/valid-compile
  export let statuts;

  const details = <DetailsMiseAJourPropriete>activite.details;
  const ancienneValeur: PrioriteMesure = <PrioriteMesure>details.ancienneValeur;
  const nouvelleValeur: PrioriteMesure = <PrioriteMesure>details.nouvelleValeur;
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
