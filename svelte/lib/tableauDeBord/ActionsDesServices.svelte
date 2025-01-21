<script lang="ts">
  import Bouton from '../ui/Bouton.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirDuplication from '../ui/tiroirs/TiroirDuplication.svelte';
  import TiroirExportServices from '../ui/tiroirs/TiroirExportServices.svelte';
  import type { Service } from './tableauDeBord.d';
  import TiroirTelechargementDocumentsService from '../ui/tiroirs/TiroirTelechargementDocumentsService.svelte';
  import TiroirGestionContributeurs from '../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import TiroirSuppression from '../ui/tiroirs/TiroirSuppression.svelte';

  export let selection: Service[];

  $: actionsDisponibles = selection.length !== 0;
  $: selectionUnique = selection.length === 1;
  $: estProprietaireDesServicesSelectionnes = selection.every(
    (s) => s.estProprietaire
  );
  $: ontDesDocuments = selection.every((s) => s.documentsPdfDisponibles.length);
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
      actif={actionsDisponibles && estProprietaireDesServicesSelectionnes}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirGestionContributeurs, {
          services: selection,
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
          service: selection[0],
        })}
    />
    <Bouton
      titre="Exporter la sélection"
      icone="export"
      taille="moyen"
      type="lien"
      actif={actionsDisponibles}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirExportServices, {
          services: selection,
        })}
    />
    <Bouton
      titre="Dupliquer"
      icone="copie"
      taille="moyen"
      type="lien"
      actif={actionsDisponibles &&
        selectionUnique &&
        estProprietaireDesServicesSelectionnes}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirDuplication, {
          service: selection[0],
        })}
    />
    <Bouton
      titre="Supprimer"
      icone="suppression"
      taille="moyen"
      type="lien"
      actif={actionsDisponibles && estProprietaireDesServicesSelectionnes}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirSuppression, { services: selection })}
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
