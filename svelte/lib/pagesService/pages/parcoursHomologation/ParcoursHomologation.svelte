<script lang="ts">
  import { onMount } from 'svelte';
  import * as api from './parcoursHomologation.api';
  import type {
    ComposantEtape,
    EtapeParcoursHomologation,
    IdEtapeParcoursHomologation,
    InstanceEtapeParcoursHomologation,
  } from './parcoursHomologation.types';
  import { etapeDeURL } from './routeurParcours';
  import { routeurStore } from '../../store/routeur.store';
  import EtapeAutorite from './etapes/EtapeAutorite.svelte';
  import type { Dossier } from '../homologuer/homologuer.types';
  import EtapeAvis from './etapes/EtapeAvis.svelte';
  import EtapeDocuments from './etapes/EtapeDocuments.svelte';
  import EtapeDateTelechargement from './etapes/EtapeDateTelechargement.svelte';
  import EtapeDecision from './etapes/EtapeDecision.svelte';
  import type {
    EcheancesRenouvellementHomologation,
    StatutsAvisDossierHomologation,
  } from '../../pagesService.d';

  interface Props {
    idService: string;
    dossier: Dossier;
    statutsAvisDossierHomologation: StatutsAvisDossierHomologation;
    etapesParcours: Array<EtapeParcoursHomologation>;
    echeancesRenouvellement: EcheancesRenouvellementHomologation;
    peutHomologuer: boolean;
  }

  let {
    idService,
    dossier,
    etapesParcours,
    statutsAvisDossierHomologation,
    echeancesRenouvellement,
    peutHomologuer,
  }: Props = $props();

  let etapeCourante: IdEtapeParcoursHomologation | undefined = $state();
  let detailsEtapeCourante: EtapeParcoursHomologation | undefined = $derived(
    etapesParcours.find((e) => e.id === etapeCourante)
  );
  let detailsEtapeSuivante = $derived(
    detailsEtapeCourante
      ? etapesParcours.find((e) => e.numero === detailsEtapeCourante.numero + 1)
      : undefined
  );

  onMount(async () => {
    etapeCourante = await api.reprendsParcours(
      idService,
      etapeDeURL(window.location.pathname)
    );
  });

  const suivant = async () => {
    await composantEtapeCourante?.enregistre();
    document.dispatchEvent(new CustomEvent('homologation-modifiee'));
    if (detailsEtapeSuivante) etapeCourante = detailsEtapeSuivante.id;
  };

  const annuler = () => {
    routeurStore.navigue(`/service/${idService}/dossiers`);
  };

  let composantEtapeCourante: InstanceEtapeParcoursHomologation | undefined =
    $state();

  const composants: Record<IdEtapeParcoursHomologation, ComposantEtape> = {
    autorite: EtapeAutorite,
    avis: EtapeAvis,
    documents: EtapeDocuments,
    dateTelechargement: EtapeDateTelechargement,
    decision: EtapeDecision,
  };
</script>

{#if etapeCourante && dossier && detailsEtapeCourante}
  {@const Composant = composants[etapeCourante]}
  <dsfr-stepper
    title={detailsEtapeCourante.libelle}
    next-step={detailsEtapeSuivante?.libelle}
    step-count={etapesParcours.length}
    current-step={detailsEtapeCourante.numero}
    {...detailsEtapeSuivante === undefined ? { 'hide-details': true } : {}}
  >
  </dsfr-stepper>
  <hr />
  <div>
    <Composant
      {idService}
      {dossier}
      {statutsAvisDossierHomologation}
      {echeancesRenouvellement}
      {peutHomologuer}
      bind:this={composantEtapeCourante}
    />
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
  :root {
    --parcours-homologation-largeur-formulaire: 894px;
  }

  hr {
    border: none;
    border-top: 1px solid #dddddd;
    margin-bottom: 2rem;
  }

  .bandeau-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 2rem;
  }
</style>
