<script lang="ts">
  import { onMount } from 'svelte';
  import * as api from './parcoursHomologation.api';
  import type { EtapeParcoursHomologation } from './parcoursHomologation.types';
  import { etapeDeURL } from './routeurParcours';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  let etapeCourante: EtapeParcoursHomologation | undefined = $state();
  onMount(async () => {
    etapeCourante = await api.reprendsParcours(idService, etapeDeURL());
  });
</script>

{#if etapeCourante}
  <pre>{etapeCourante}</pre>
{/if}

<style lang="scss">
</style>
