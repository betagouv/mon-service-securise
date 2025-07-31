<script lang="ts">
  import EtapierTiroir from '../EtapierTiroir.svelte';
  import SecondeEtape from './SecondeEtape.svelte';
  import TroisiemeEtape from './TroisiemeEtape.svelte';
  import PremiereEtape from './PremiereEtape.svelte';
  import type { ModeleMesure, ReferentielStatut } from '../../../../ui/types';
  import type { StatutMesure } from '../../../../modeles/modeleMesure';

  export let etapeCourante;
  export let modeleMesure: ModeleMesure;
  export let statuts: ReferentielStatut;
  export let statutSelectionne: StatutMesure | '';
  export let precision: string;
  export let idsServicesSelectionnes: string[];

  $: modificationPrecisionUniquement = !statutSelectionne && !!precision;
</script>

<EtapierTiroir {etapeCourante} />
<hr />
{#if etapeCourante === 1}
  <PremiereEtape {statuts} bind:statutSelectionne bind:precision />
{:else if etapeCourante === 2}
  <SecondeEtape
    {statuts}
    {modeleMesure}
    {modificationPrecisionUniquement}
    bind:idsServicesSelectionnes
  />
{:else if etapeCourante === 3}
  <TroisiemeEtape
    {modeleMesure}
    {precision}
    {statuts}
    {statutSelectionne}
    {idsServicesSelectionnes}
  />
{/if}

<style lang="scss">
  hr {
    width: 100%;
    border-top: none;
    border-bottom: 1px solid #dddddd;
  }
</style>
