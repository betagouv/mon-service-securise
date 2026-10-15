<script lang="ts">
  import type { ReferentielStatut, ReferentielTypesService } from '../ui/types';
  import type {
    ListeMesuresProps,
    ServiceAvecMesuresAssociees,
  } from './listeMesures.d';
  import Modale from '../ui/Modale.svelte';

  let elementModale: Modale | undefined = $state();

  interface Props {
    referentielStatuts: ReferentielStatut;
    referentielTypesService: ReferentielTypesService;
    categories: ListeMesuresProps['categories'];
    services: ServiceAvecMesuresAssociees[];
  }

  let {
    referentielStatuts,
    referentielTypesService,
    categories,
    services,
  }: Props = $props();

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale bind:this={elementModale}>
  {#snippet entete()}

  {/snippet}
  {#snippet contenu()}

  {/snippet}
  {#snippet actions()}

  {/snippet}
</Modale>
