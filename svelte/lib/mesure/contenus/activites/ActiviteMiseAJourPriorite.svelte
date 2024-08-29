<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsAjoutPropriete,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import TagPrioriteMesure from '../../../ui/TagPrioriteMesure.svelte';
  import type { PrioriteMesure, ReferentielPriorite } from '../../../ui/types';

  export let activite: ActiviteMesure;
  export let priorites: ReferentielPriorite;

  const details = <DetailsMiseAJourPropriete>activite.details;
  const ancienneValeur: PrioriteMesure = <PrioriteMesure>details.ancienneValeur;
  const nouvelleValeur: PrioriteMesure = <PrioriteMesure>details.nouvelleValeur;
</script>

<div>
  La priorité de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> a été
  modifiée de
  <TagPrioriteMesure {priorites} priorite={ancienneValeur} />
  à
  <TagPrioriteMesure {priorites} priorite={nouvelleValeur} />
</div>
