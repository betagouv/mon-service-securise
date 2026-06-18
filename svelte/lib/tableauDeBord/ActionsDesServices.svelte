<script module lang="ts">
  import type { BrouillonService, Service } from './tableauDeBord.d';
  export type TypeSelection = 'Service' | 'Brouillon';
  export type ServiceOuBrouillon = (Service | BrouillonService) & {
    type: TypeSelection;
  };
</script>

<script lang="ts">
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirDuplication from '../ui/tiroirs/TiroirDuplication.svelte';
  import TiroirExportServices from '../ui/tiroirs/TiroirExportServices.svelte';
  import TiroirTelechargementDocumentsService from '../ui/tiroirs/TiroirTelechargementDocumentsService.svelte';
  import TiroirGestionContributeurs from '../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import TiroirSuppression from '../ui/tiroirs/TiroirSuppression.svelte';

  interface Props {
    selection: ServiceOuBrouillon[];
  }

  let { selection }: Props = $props();

  const estService = (
    s: ServiceOuBrouillon
  ): s is Service & { type: TypeSelection } => s.type === 'Service';

  const seulementLesServices = (tous: ServiceOuBrouillon[]): Service[] =>
    tous
      .filter(estService)
      .map(({ type: _type, ...service }) => service as Service);

  let actionsDisponibles = $derived(selection.length !== 0);
  let selectionUnique = $derived(selection.length === 1);
  let estProprietaireDesServicesSelectionnes = $derived(
    selection.filter(estService).every((s) => s.estProprietaire)
  );
  let selectionPossedeDesBrouillons = $derived(
    selection.some((s) => s.type === 'Brouillon')
  );
  let ontDesDocuments = $derived(
    selection.every((s) => estService(s) && s.documentsPdfDisponibles.length)
  );
</script>

<div class="conteneur-actions" class:avec-nombre-lignes={actionsDisponibles}>
  <div class="boutons-actions">
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <dsfr-button
      label="Gérer les contributeurs"
      icon="group-line"
      kind="tertiary-no-outline"
      has-icon
      disabled={!(
        actionsDisponibles &&
        estProprietaireDesServicesSelectionnes &&
        !selectionPossedeDesBrouillons
      )}
      onclick={() =>
        tiroirStore.afficheContenu(TiroirGestionContributeurs, {
          services: seulementLesServices(selection),
        })}
    ></dsfr-button>
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <dsfr-button
      label="Télécharger PDFs"
      icon="file-download-line"
      kind="tertiary-no-outline"
      has-icon
      disabled={!(actionsDisponibles && selectionUnique && ontDesDocuments)}
      onclick={() =>
        tiroirStore.afficheContenu(TiroirTelechargementDocumentsService, {
          service: seulementLesServices(selection)[0],
        })}
    ></dsfr-button>
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <dsfr-button
      label="Exporter la sélection"
      icon="inbox-archive-line"
      kind="tertiary-no-outline"
      has-icon
      disabled={!(actionsDisponibles && !selectionPossedeDesBrouillons)}
      onclick={() =>
        tiroirStore.afficheContenu(TiroirExportServices, {
          services: seulementLesServices(selection),
        })}
    ></dsfr-button>
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <dsfr-button
      label="Dupliquer"
      icon="file-line"
      kind="tertiary-no-outline"
      has-icon
      disabled={!(
        actionsDisponibles &&
        selectionUnique &&
        estProprietaireDesServicesSelectionnes &&
        !selectionPossedeDesBrouillons
      )}
      onclick={() =>
        tiroirStore.afficheContenu(TiroirDuplication, {
          service: seulementLesServices(selection)[0],
        })}
    ></dsfr-button>
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <dsfr-button
      label="Supprimer"
      icon="delete-bin-line"
      kind="tertiary-no-outline"
      has-icon
      disabled={!(actionsDisponibles && estProprietaireDesServicesSelectionnes)}
      onclick={() =>
        tiroirStore.afficheContenu(TiroirSuppression, {
          servicesEtBrouillon: selection,
        })}
    ></dsfr-button>
  </div>
</div>

<style>
  .conteneur-actions {
    display: flex;
    align-items: center;
    justify-content: end;
  }

  .conteneur-actions.avec-nombre-lignes {
    justify-content: space-between;
  }

  .boutons-actions {
    display: flex;
    gap: 16px;
  }
</style>
