<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import TagEcheanceMesure from '../../../ui/TagEcheanceMesure.svelte';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  export let activite: ActiviteMesure;
  // eslint-disable-next-line svelte/valid-compile
  export let priorites, statuts;

  const details = <DetailsAjoutPropriete>activite.details;
  const echeance = new Date(details.nouvelleValeur);
</script>

<div>
  <div>
    L'échéance de la <DesignationMesureActivite {activite} /> a été fixée au
  </div>
  <div>
    <TagEcheanceMesure {echeance} />
  </div>
</div>
