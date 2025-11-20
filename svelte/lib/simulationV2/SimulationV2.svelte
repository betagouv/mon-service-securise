<script lang="ts">
  import { onMount } from 'svelte';
  import type { MiseAJour } from '../creationV2/creationV2.api';
  import AssistantServiceV2 from '../creationV2/AssistantServiceV2.svelte';
  import { navigationStore } from '../creationV2/etapes/navigation.store';
  import {
    toutesEtapesSimulation,
    toutesEtapesSimulationModeRapide,
  } from '../creationV2/etapes/toutesEtapes';
  import type { UUID } from '../typesBasiquesSvelte';

  export let idService: UUID;

  let enCoursDeChargement = false;

  navigationStore.chargeConfigurationEtapes(
    toutesEtapesSimulation,
    toutesEtapesSimulationModeRapide
  );

  onMount(async () => {});

  const metsAJourPropriete = async (e: CustomEvent<MiseAJour>) => {};

  const finalise = async () => {};
</script>

<AssistantServiceV2
  on:champModifie={metsAJourPropriete}
  on:finalise={finalise}
  bind:enCoursDeChargement
  titreAssistant="Actualiser votre service"
/>
