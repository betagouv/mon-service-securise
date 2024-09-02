<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import TagEcheanceMesure from '../../../ui/TagEcheanceMesure.svelte';

  export let activite: ActiviteMesure;
  // eslint-disable-next-line svelte/valid-compile
  export let priorites, statuts;

  const details = <DetailsMiseAJourPropriete>activite.details;
  const ancienneEcheance = new Date(details.ancienneValeur);
  const nouvelleEcheance = new Date(details.nouvelleValeur);
</script>

<div>
  <div>
    L'échéance de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> a été modifiée
    du
  </div>
  <div>
    <span class="ancienne"
      ><TagEcheanceMesure echeance={ancienneEcheance} /></span
    >au<span class="nouvelle"
      ><TagEcheanceMesure echeance={nouvelleEcheance} /></span
    >
  </div>
</div>

<style>
  .ancienne {
    margin-right: 8px;
  }

  .nouvelle {
    margin-left: 8px;
  }
</style>
