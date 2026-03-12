<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import TagEcheanceMesure from '../../../ui/TagEcheanceMesure.svelte';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  interface Props {
    activite: ActiviteMesure;
  }

  let { activite }: Props = $props();

  let details = $derived(activite.details as DetailsMiseAJourPropriete);
  let ancienneEcheance = $derived(new Date(details.ancienneValeur));
  let nouvelleEcheance = $derived(new Date(details.nouvelleValeur));
</script>

<div>
  <div>
    L'échéance de la <DesignationMesureActivite {activite} /> a été modifiée du
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
