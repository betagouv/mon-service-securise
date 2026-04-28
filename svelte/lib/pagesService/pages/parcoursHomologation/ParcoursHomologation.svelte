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
  import EtapeRecapitulatif from './etapes/EtapeRecapitulatif.svelte';
  import type {
    EcheancesRenouvellementHomologation,
    StatutsAvisDossierHomologation,
  } from '../../pagesService.d';
  import VoirDemarcheIndicative from './kit/VoirDemarcheIndicative.svelte';
  import type { IdNiveauDeSecurite } from '../../../ui/types';

  interface Props {
    idService: string;
    dossier: Dossier;
    statutsAvisDossierHomologation: StatutsAvisDossierHomologation;
    etapesParcours: Array<EtapeParcoursHomologation>;
    echeancesRenouvellement: EcheancesRenouvellementHomologation;
    peutHomologuer: boolean;
    niveauSecurite: IdNiveauDeSecurite;
  }

  let {
    idService,
    dossier,
    etapesParcours,
    statutsAvisDossierHomologation,
    echeancesRenouvellement,
    peutHomologuer,
    niveauSecurite,
  }: Props = $props();

  let etapeCourante: IdEtapeParcoursHomologation | undefined = $state();
  let estDerniereEtape = $derived(etapeCourante === etapesParcours.at(-1)?.id);
  let detailsEtapeCourante: EtapeParcoursHomologation | undefined = $derived(
    etapesParcours.find((e) => e.id === etapeCourante)
  );
  let detailsEtapeSuivante = $derived(
    detailsEtapeCourante
      ? etapesParcours.find((e) => e.numero === detailsEtapeCourante.numero + 1)
      : undefined
  );
  let detailsEtapePrecedente = $derived(
    detailsEtapeCourante
      ? etapesParcours.find((e) => e.numero === detailsEtapeCourante.numero - 1)
      : undefined
  );

  onMount(async () => {
    etapeCourante = await api.reprendsParcours(
      idService,
      etapeDeURL(window.location.pathname)
    );
    document.dispatchEvent(new CustomEvent('parcours-homologation-initie'));
  });

  const suivant = async () => {
    await composantEtapeCourante?.enregistre();
    document.dispatchEvent(new CustomEvent('homologation-modifiee'));
    if (detailsEtapeSuivante) {
      routeurStore.navigue(
        `/service/${idService}/homologation/edition/etape/${detailsEtapeSuivante.id}`
      );
    }
  };

  const precedent = async () => {
    await composantEtapeCourante?.enregistre();
    document.dispatchEvent(new CustomEvent('homologation-modifiee'));
    if (detailsEtapePrecedente) {
      routeurStore.navigue(
        `/service/${idService}/homologation/edition/etape/${detailsEtapePrecedente.id}`
      );
    }
  };

  const annuler = () => {
    routeurStore.navigue(`/service/${idService}/dossiers`);
  };

  const enregistrerDecision = async () => {
    const estRefusee = dossier.decision.refusee;
    await api.enregistrement(idService).finalise();
    document.dispatchEvent(new CustomEvent('homologation-finalisee'));
    routeurStore.navigue(
      `/service/${idService}/dossiers?${estRefusee ? 'tab=refusees' : 'succesHomologation=true&tab=actif'}`
    );
  };

  let composantEtapeCourante: InstanceEtapeParcoursHomologation | undefined =
    $state();

  const composants: Record<IdEtapeParcoursHomologation, ComposantEtape> = {
    autorite: EtapeAutorite,
    avis: EtapeAvis,
    documents: EtapeDocuments,
    dateTelechargement: EtapeDateTelechargement,
    decision: EtapeDecision,
    recapitulatif: EtapeRecapitulatif,
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
  <div class="etape-parcours">
    <hr />
    <Composant
      {idService}
      {dossier}
      {statutsAvisDossierHomologation}
      {echeancesRenouvellement}
      {peutHomologuer}
      bind:this={composantEtapeCourante}
    />
  </div>
  <VoirDemarcheIndicative {etapeCourante} {niveauSecurite} />
  <div class="bandeau-actions">
    {#if detailsEtapeCourante.numero === 1}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button label="Annuler" kind="tertiary" onclick={annuler}
      ></dsfr-button>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button label="Précédent" kind="tertiary" onclick={precedent}
      ></dsfr-button>
    {/if}
    {#if estDerniereEtape}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Enregistrer la décision"
        kind="primary"
        icon="save-line"
        icon-place="right"
        onclick={enregistrerDecision}
      ></dsfr-button>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Suivant"
        kind="primary"
        has-icon
        icon="arrow-right-line"
        icon-place="right"
        onclick={suivant}
      ></dsfr-button>
    {/if}
  </div>
{/if}

<style lang="scss">
  :root {
    --parcours-homologation-largeur-formulaire: 894px;
  }

  dsfr-stepper {
    width: calc(var(--parcours-homologation-largeur-formulaire) * 2 / 3);
  }

  .etape-parcours {
    width: var(--parcours-homologation-largeur-formulaire);
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
