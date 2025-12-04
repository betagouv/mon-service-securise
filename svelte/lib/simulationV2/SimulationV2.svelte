<script lang="ts">
  import { onMount } from 'svelte';
  import { type MiseAJour } from '../creationV2/creationV2.api';
  import AssistantServiceV2 from '../creationV2/AssistantServiceV2.svelte';
  import { navigationStore } from '../creationV2/etapes/navigation.store';
  import {
    toutesEtapesSimulation,
    toutesEtapesSimulationModeRapide,
  } from '../creationV2/etapes/toutesEtapes';
  import type { UUID } from '../typesBasiquesSvelte';
  import { leBrouillon } from '../creationV2/etapes/brouillon.store';
  import {
    finaliseMigration,
    lisSimulation,
    metsAJourSimulation,
  } from './simulationv2.api';
  import type { BrouillonServiceV2 } from '../creationV2/creationV2.types';
  import { etapeCourante } from '../creationV2/etapes/etapeCourante.store';

  export let idService: UUID;

  let enCoursDeChargement = false;

  navigationStore.chargeConfigurationEtapes(
    toutesEtapesSimulation,
    toutesEtapesSimulationModeRapide
  );

  onMount(async () => {
    const donneesSimulation = await lisSimulation(idService);
    leBrouillon.chargeDonnees(donneesSimulation);
  });

  const metsAJourPropriete = async (e: CustomEvent<MiseAJour>) => {
    await metsAJourSimulation(idService, e.detail);

    const nomChampModifie = Object.keys(
      e.detail
    )[0] as keyof BrouillonServiceV2;
    const onEstToujoursSurLaQuestionQuiAEnvoyeLaMaj =
      $etapeCourante.questionCourante.clesPropriete.includes(nomChampModifie);
    // si on n'est plus sur la question mise à jour, c'est que "suivant()" a déjà été appelé
    if (
      onEstToujoursSurLaQuestionQuiAEnvoyeLaMaj &&
      $etapeCourante.questionCourante.avecAvanceRapide
    )
      navigationStore.suivant();
  };

  const finalise = async () => {
    enCoursDeChargement = true;
    await finaliseMigration(idService);
    window.location.href = `/service/${idService}/mesures?succesChangementReferentiel=true`;
    enCoursDeChargement = false;
  };
</script>

<AssistantServiceV2
  on:champModifie={metsAJourPropriete}
  on:finalise={finalise}
  bind:enCoursDeChargement
  titreAssistant="Actualiser votre service"
  titreBoutonFinalise="Passer au nouveau référentiel"
>
  <svelte:fragment slot="action-supplementaire">
    {#if $etapeCourante.estDerniereQuestion}
      <lab-anssi-lien
        titre="Je reviendrai plus tard"
        apparence="bouton"
        variante="secondaire"
        taille="md"
        positionIcone="sans"
        href="/tableauDeBord"
      />
    {/if}
  </svelte:fragment>
</AssistantServiceV2>
