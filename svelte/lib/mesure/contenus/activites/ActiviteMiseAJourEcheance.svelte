<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import TagEcheanceMesure from '../../../ui/TagEcheanceMesure.svelte';

  export let activite: ActiviteMesure;

  const details = <DetailsMiseAJourPropriete>activite.details;
  const ancienneEcheance = new Date(details.ancienneValeur);
  const nouvelleEcheance = new Date(details.nouvelleValeur);
</script>

<div>
  L'échéance de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> a été
  modifiée du
  <TagEcheanceMesure echeance={ancienneEcheance} />
  au
  <TagEcheanceMesure echeance={nouvelleEcheance} />
</div>
