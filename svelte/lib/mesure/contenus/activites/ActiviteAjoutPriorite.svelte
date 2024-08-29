<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import TagPrioriteMesure from '../../../ui/TagPrioriteMesure.svelte';
  import type { PrioriteMesure, ReferentielPriorite } from '../../../ui/types';

  export let activite: ActiviteMesure;
  export let priorites: ReferentielPriorite;

  const details: DetailsAjoutPropriete = <DetailsAjoutPropriete>(
    activite.details
  );
  const priorite: PrioriteMesure = <PrioriteMesure>details.nouvelleValeur;
</script>

<div>
  La priorité de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> est
  <TagPrioriteMesure {priorites} {priorite} />
</div>
