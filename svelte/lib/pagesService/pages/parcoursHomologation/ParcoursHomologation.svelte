<script lang="ts">
  import { onMount } from 'svelte';
  import * as api from './parcoursHomologation.api';
  import type {
    ComposantEtape,
    EtapeParcoursHomologation,
    InstanceEtapeParcoursHomologation,
  } from './parcoursHomologation.types';
  import { etapeDeURL } from './routeurParcours';
  import { routeurStore } from '../../store/routeur.store';
  import EtapeAutorite from './etapes/EtapeAutorite.svelte';
  import type { Dossier } from '../homologuer/homologuer.types';
  import EtapeAvis from './etapes/EtapeAvis.svelte';

  interface Props {
    idService: string;
    dossier: Dossier;
  }

  let { idService, dossier }: Props = $props();

  let etapeCourante: EtapeParcoursHomologation | undefined = $state();
  onMount(async () => {
    etapeCourante = await api.reprendsParcours(idService, etapeDeURL());
  });

  const suivant = async () => {
    await composantEtapeCourante?.enregistre();
    etapeCourante = 'avis';
  };

  const annuler = () => {
    routeurStore.navigue(`/service/${idService}/dossiers`);
  };

  let composantEtapeCourante: InstanceEtapeParcoursHomologation | undefined =
    $state();

  const composants: Record<EtapeParcoursHomologation, ComposantEtape> = {
    autorite: EtapeAutorite,
    avis: EtapeAvis,
  };
</script>

{#if etapeCourante && dossier}
  {@const Composant = composants[etapeCourante]}
  <dsfr-stepper
    title="Autorité"
    next-step="Avis sur la sécurité du service"
    step-count="6"
    current-step="1"
  >
  </dsfr-stepper>
  <hr />
  <div>
    <Composant {idService} {dossier} bind:this={composantEtapeCourante} />
  </div>
  <div class="bandeau-actions">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button label="Annuler" kind="tertiary" onclick={annuler}
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Suivant"
      kind="primary"
      has-icon
      icon="arrow-right-line"
      icon-place="right"
      onclick={suivant}
    ></dsfr-button>
  </div>
{/if}

<style lang="scss">
  hr {
    border: none;
    border-top: 1px solid #dddddd;
    margin-bottom: 2rem;
  }

  .bandeau-actions {
  }
</style>
