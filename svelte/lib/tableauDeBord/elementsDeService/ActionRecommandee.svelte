<script lang="ts">
  import type { ActionRecommandee } from '../tableauDeBord.d';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirGestionContributeurs from '../../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import type { Service } from '../tableauDeBord.d';

  interface Props {
    action: ActionRecommandee;
    service: Service;
  }

  let { action, service }: Props = $props();

  let idService = $derived(service.id);
</script>

{#if action.id === 'mettreAJour'}
  <dsfr-button
    kind="secondary"
    markup="a"
    disabled={!action.autorisee}
    label="Finaliser la description"
    href="/service/{idService}"
    has-icon
    icon="edit-line"
    size="sm"
  ></dsfr-button>
{:else if action.id === 'continuerHomologation'}
  <dsfr-button
    kind="secondary"
    markup="a"
    disabled={!action.autorisee}
    label="Continuer l'homologation"
    href="/service/{idService}/homologation/edition/etape/recapitulatif"
    size="sm"
    has-icon
    icon="edit-box-line"
  ></dsfr-button>
{:else if action.id === 'augmenterIndiceCyber'}
  <dsfr-button
    kind="secondary"
    markup="a"
    disabled={!action.autorisee}
    label="Augmenter l’indice cyber"
    href="/service/{idService}/mesures"
    size="sm"
    has-icon
    icon="donut-chart-line"
  ></dsfr-button>
{:else if action.id === 'telechargerEncartHomologation'}
  <dsfr-button
    kind="secondary"
    markup="a"
    disabled={!action.autorisee}
    label="Télécharger l'encart"
    href="/service/{idService}/dossiers?succesHomologation=true"
    size="sm"
    has-icon
    icon="download-line"
  ></dsfr-button>
{:else if action.id === 'homologuerANouveau'}
  <dsfr-button
    kind="secondary"
    markup="a"
    disabled={!action.autorisee}
    label="Homologuer à nouveau"
    href="/service/{idService}/dossiers"
    size="sm"
    has-icon
    icon="award-line"
  ></dsfr-button>
{:else if action.id === 'homologuerService'}
  <dsfr-button
    kind="secondary"
    markup="a"
    disabled={!action.autorisee}
    label="Homologuer le service"
    href="/service/{idService}/dossiers"
    size="sm"
    has-icon
    icon="award-line"
  ></dsfr-button>
{:else if action.id === 'inviterContributeur'}
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
  <dsfr-button
    disabled={!action.autorisee}
    label="Inviter un contributeur"
    kind="secondary"
    size="sm"
    has-icon
    icon="user-add-line"
    onclick={() =>
      tiroirStore.afficheContenu(TiroirGestionContributeurs, {
        services: [service],
      })}
  ></dsfr-button>
{:else if action.id === 'simulerReferentielV2'}
  <dsfr-button
    kind="secondary"
    markup="a"
    disabled={!action.autorisee}
    label="Simuler le référentiel 2025"
    href="/service/{idService}/simulation-referentiel-v2"
    size="sm"
    has-icon
    icon="restart-line"
  ></dsfr-button>
{:else if action.id === 'continuerSimulationReferentielV2'}
  <dsfr-button
    kind="secondary"
    markup="a"
    disabled={!action.autorisee}
    label="Continuer les modifications"
    href="/service/{idService}/simulation-referentiel-v2"
    size="sm"
    has-icon
    icon="refresh-line"
  ></dsfr-button>
{/if}

<style>
  dsfr-button {
    white-space: nowrap;
  }
</style>
