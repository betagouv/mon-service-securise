<script lang="ts">
  import Bouton from '../ui/Bouton.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirDuplication from '../ui/tiroirs/TiroirDuplication.svelte';
  import TiroirExportServices from '../ui/tiroirs/TiroirExportServices.svelte';

  export let selection: string[];

  $: actionsDisponibles = selection.length !== 0;
  $: selectionUnique = selection.length === 1;
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
      titre="Télécharger PDFs"
      icone="telechargement"
      type="lien"
      actif={actionsDisponibles && selectionUnique}
    />
    <Bouton
      titre="Exporter la sélection"
      icone="export"
      type="lien"
      actif={actionsDisponibles}
      on:click={() =>
        tiroirStore.afficheContenu(
          TiroirExportServices,
          { idServices: selection },
          {
            titre: 'Exporter la sélection',
            sousTitre:
              'Télécharger les données du service sélectionné dans le tableau de bord.',
          }
        )}
    />
    <Bouton
      titre="Dupliquer"
      icone="copie"
      type="lien"
      actif={actionsDisponibles && selectionUnique}
      on:click={() =>
        tiroirStore.afficheContenu(
          TiroirDuplication,
          { idService: selection[0] },
          {
            titre: 'Dupliquer',
            sousTitre:
              "Créer une ou plusieurs copies du services sélectionné. Cette copie n'inclut pas les données concernant son homologation.",
          }
        )}
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
