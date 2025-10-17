<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    modifier: null;
    enregistrer: null;
    annuler: null;
  }>();

  type ModeAffichage = 'Résumé' | 'Édition';
  export let mode: ModeAffichage;
</script>

<div class="barre-actions">
  <div class="les-boutons">
    {#if mode === 'Résumé'}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Modifier le service"
        variante="tertiaire"
        taille="md"
        icone="edit-line"
        positionIcone="droite"
        on:click={() => dispatch('modifier')}
      />
    {:else if mode === 'Édition'}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Enregistrer les modifications"
        variante="primaire"
        taille="md"
        icone="save-line"
        positionIcone="gauche"
        on:click={() => dispatch('enregistrer')}
      />
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Annuler"
        variante="tertiaire"
        taille="md"
        positionIcone="sans"
        on:click={() => dispatch('annuler')}
      />
      <span class="attention-aux-besoins">
        <img src="/statique/assets/images/icone_attention_rose.svg" alt="" />
        En modifiant ce service, ses besoins en sécurité pourront être réévalués.
      </span>
    {/if}
  </div>
</div>

<style lang="scss">
  .barre-actions {
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1px solid #ddd;
    padding: 24px 0;

    .les-boutons {
      max-width: 1000px;
      padding: 0 54px;
      margin: 0 auto;

      display: flex;
      align-items: center;
      gap: 16px;

      lab-anssi-bouton {
        flex-shrink: 0;
      }

      .attention-aux-besoins {
        color: #666;
        text-align: left;
        display: flex;
        img {
          width: 16px;
          filter: invert(41%) sepia(0%) saturate(0%) hue-rotate(16deg)
            brightness(94%) contrast(87%);
          margin-right: 4px;
        }
      }
    }
  }
</style>
