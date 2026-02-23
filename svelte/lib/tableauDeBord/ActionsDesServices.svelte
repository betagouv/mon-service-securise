<script context="module" lang="ts">
  import type { BrouillonService, Service } from './tableauDeBord.d';
  export type TypeSelection = 'Service' | 'Brouillon';
  export type ServiceOuBrouillon = (Service | BrouillonService) & {
    type: TypeSelection;
  };
</script>

<script lang="ts">
  import Bouton from '../ui/Bouton.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirDuplication from '../ui/tiroirs/TiroirDuplication.svelte';
  import TiroirExportServices from '../ui/tiroirs/TiroirExportServices.svelte';
  import TiroirTelechargementDocumentsService from '../ui/tiroirs/TiroirTelechargementDocumentsService.svelte';
  import TiroirGestionContributeurs from '../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import TiroirSuppression from '../ui/tiroirs/TiroirSuppression.svelte';

  export let selection: ServiceOuBrouillon[];

  const estService = (
    s: ServiceOuBrouillon
  ): s is Service & { type: TypeSelection } => s.type === 'Service';

  const seulementLesServices = (tous: ServiceOuBrouillon[]): Service[] =>
    tous.filter(estService).map(({ type, ...service }) => service as Service);

  $: actionsDisponibles = selection.length !== 0;
  $: selectionUnique = selection.length === 1;
  $: estProprietaireDesServicesSelectionnes = selection
    .filter(estService)
    .every((s) => s.estProprietaire);
  $: selectionPossedeDesBrouillons = selection.some(
    (s) => s.type === 'Brouillon'
  );
  $: ontDesDocuments = selection.every(
    (s) => estService(s) && s.documentsPdfDisponibles.length
  );
</script>

<div class="conteneur-actions" class:avec-nombre-lignes={actionsDisponibles}>
  {#if actionsDisponibles}
    {@const pluriel = selection.length > 1 ? 's' : ''}
    <span class="nombre-selection">
      {selection.length}
      ligne{pluriel}
      sélectionnée{pluriel}
    </span>
  {/if}
  <div class="boutons-actions">
    <Bouton
      titre="Gérer les contributeurs"
      icone="contributeurs"
      taille="moyen"
      type="lien"
      actif={actionsDisponibles &&
        estProprietaireDesServicesSelectionnes &&
        !selectionPossedeDesBrouillons}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirGestionContributeurs, {
          services: seulementLesServices(selection),
        })}
    />
    <Bouton
      titre="Télécharger PDFs"
      icone="telechargement"
      taille="moyen"
      type="lien"
      actif={actionsDisponibles && selectionUnique && ontDesDocuments}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirTelechargementDocumentsService, {
          service: seulementLesServices(selection)[0],
        })}
    />
    <Bouton
      titre="Exporter la sélection"
      icone="export"
      taille="moyen"
      type="lien"
      actif={actionsDisponibles && !selectionPossedeDesBrouillons}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirExportServices, {
          services: seulementLesServices(selection),
        })}
    />
    <Bouton
      titre="Dupliquer"
      icone="copie"
      taille="moyen"
      type="lien"
      actif={actionsDisponibles &&
        selectionUnique &&
        estProprietaireDesServicesSelectionnes &&
        !selectionPossedeDesBrouillons}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirDuplication, {
          service: seulementLesServices(selection)[0],
        })}
    />
    <Bouton
      titre="Supprimer"
      icone="suppression"
      taille="moyen"
      type="lien"
      actif={actionsDisponibles && estProprietaireDesServicesSelectionnes}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirSuppression, {
          servicesEtBrouillon: selection,
        })}
    />
  </div>
</div>

<style>
  .conteneur-actions {
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: end;
  }

  .conteneur-actions.avec-nombre-lignes {
    justify-content: space-between;
  }

  .nombre-selection {
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
    color: var(--gris-texte-additionnel);
  }

  .boutons-actions {
    display: flex;
    gap: 16px;
  }
</style>
