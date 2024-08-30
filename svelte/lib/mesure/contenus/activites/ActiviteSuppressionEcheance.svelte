<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import TagEcheanceMesure from '../../../ui/TagEcheanceMesure.svelte';

  export let activite: ActiviteMesure;
</script>

<div>
  L'échéance de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> a été supprimée
</div>
