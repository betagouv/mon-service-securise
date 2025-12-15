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
  import Modale from '../ui/Modale.svelte';

  export let idService: UUID;
  export let elementModaleConfirmationMigration: Modale;

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
  on:finalise={() => elementModaleConfirmationMigration.affiche()}
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

<Modale
  id="modale-confirmation-migration"
  bind:this={elementModaleConfirmationMigration}
>
  <svelte:fragment slot="contenu">
    <div class="contenu-modale">
      <h4>Êtes-vous sûr de vouloir passer au nouveau référentiel ?</h4>
      <dsfr-alert
        type="warning"
        size="md"
        hasTitle
        hasDescription
        title="Cette action est irréversible."
        text="Il ne sera pas possible de revenir en arrière une fois la bascule effectuée. Cependant, les données déjà renseignées (questions inchangées dans l’ajout d’un service, mesures de sécurité, statuts, commentaires, plans d'action, etc) seront automatiquement reprises."
      />
    </div>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Annuler"
      variante="secondaire"
      taille="md"
      icone=""
      positionIcone="sans"
      on:click={() => elementModaleConfirmationMigration.ferme()}
    />
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Confirmer le changement"
      variante="primaire"
      taille="md"
      icone=""
      positionIcone="sans"
      on:click={() => finalise()}
    />
  </svelte:fragment>
</Modale>

<style lang="scss">
  :global(#modale-confirmation-migration) {
    max-width: 556px;
    height: fit-content;

    :global(.contenu-modale) {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding-bottom: 24px;
      margin-top: 0;
    }

    :global(.conteneur-actions) {
      border: none;
    }

    h4 {
      font-weight: bold;
      font-size: 1.5rem;
      line-height: 2rem;
      color: #161616;
      margin: 16px 0;
    }
  }
</style>
