<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import TagEcheanceMesure from '../../../ui/TagEcheanceMesure.svelte';

  export let activite: ActiviteMesure;
  // eslint-disable-next-line svelte/valid-compile
  export let priorites, statuts;

  const details = <DetailsAjoutPropriete>activite.details;
  const echeance = new Date(details.nouvelleValeur);
</script>

<div>
  L'échéance de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> a été
  fixée au
  <TagEcheanceMesure {echeance} />
</div>
