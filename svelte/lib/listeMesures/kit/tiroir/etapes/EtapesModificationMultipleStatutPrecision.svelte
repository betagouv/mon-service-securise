<script lang="ts">
  import EtapierTiroir from '../EtapierTiroir.svelte';
  import SecondeEtape from './SecondeEtape.svelte';
  import TroisiemeEtape from './TroisiemeEtape.svelte';
  import PremiereEtape from './PremiereEtape.svelte';
  import type { ReferentielStatut } from '../../../../ui/types';
  import type { StatutMesure } from '../../../../modeles/modeleMesure';

  export let etapeCourante;
  export let statuts: ReferentielStatut;
  export let statutSelectionne: StatutMesure | '';
  export let precision: string;
  export let idsServicesSelectionnes: string[];
  export let servicesAssocies;
  export let modificationPrecisionUniquement;
  export let servicesConcernesParMaj;
</script>

<EtapierTiroir {etapeCourante} />
<hr />
{#if etapeCourante === 1}
  <PremiereEtape {statuts} bind:statutSelectionne bind:precision />
{:else if etapeCourante === 2}
  <SecondeEtape
    {statuts}
    {modificationPrecisionUniquement}
    {servicesAssocies}
    bind:idsServicesSelectionnes
  />
{:else if etapeCourante === 3}
  <TroisiemeEtape
    {precision}
    {statuts}
    {statutSelectionne}
    servicesConcernes={servicesConcernesParMaj}
  />
{/if}

<style lang="scss">
  hr {
    width: 100%;
    border-top: none;
    border-bottom: 1px solid #dddddd;
  }
</style>
