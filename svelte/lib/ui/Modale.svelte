<script lang="ts">
  import { onDestroy, createEventDispatcher } from 'svelte';

  let elementModale: HTMLDialogElement;

  export const ferme = () => {
    elementModale.close();
    debloqueScroll();
  };

  export const affiche = () => {
    elementModale.showModal();
    bloqueScroll();
  };

  const bloqueScroll = () => {
    document.body.style.overflow = 'hidden';
  };

  const debloqueScroll = () => {
    document.body.style.overflow = '';
  };

  onDestroy(() => debloqueScroll());
  const emetEvent = createEventDispatcher();
</script>

<dialog
  bind:this={elementModale}
  on:close={() => {
    debloqueScroll();
    emetEvent('close');
  }}
>
  <div class="conteneur-fermeture">
    <button on:click={() => ferme()}>Fermer</button>
  </div>
  <div class="conteneur-modale">
    <div class="entete-modale">
      <slot name="entete" />
    </div>
    <div class="contenu-modale">
      <slot name="contenu" />
    </div>
    <div class="pied-modale">
      <div class="conteneur-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</dialog>

<style lang="scss">
  .conteneur-modale {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }

  .pied-modale,
  .entete-modale {
    flex-shrink: 0;
    position: sticky;
    z-index: 1;
    background: white;
  }

  .entete-modale {
    top: 0;
  }

  .pied-modale {
    bottom: 0;
  }

  .contenu-modale {
    flex-grow: 1;
    margin-top: 24px;
    overflow-y: auto;
  }

  dialog::backdrop {
    background: rgba(22, 22, 22, 0.64);
  }

  dialog {
    width: min(calc(100vw - 52px), 1868px);
    height: min(calc(100vh - 70px), 1010px);
    padding: 64px 32px 0 32px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
    box-sizing: border-box;
    position: relative;
  }

  .conteneur-fermeture {
    position: absolute;
    top: 16px;
    right: 35px;

    button {
      border: none;
      background: none;
      padding: 4px 8px 4px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--bleu-mise-en-avant);
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.5rem;
      border-radius: 4px;

      &:hover {
        background: #f5f5f5;
      }

      &:after {
        content: '';
        background-image: url(/statique/assets/images/icone_fermeture_modale.svg);
        width: 16px;
        height: 16px;
        background-size: contain;
        background-repeat: no-repeat;
        display: inline-block;
        filter: brightness(0) invert(28%) sepia(70%) saturate(1723%)
          hue-rotate(184deg) brightness(107%) contrast(101%);
        transform: translateY(2px);
      }
    }
  }

  .conteneur-actions {
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    width: 100%;
    background: white;
    display: flex;
    margin-left: -32px;
    padding: 32px;
    flex-direction: row;
    gap: 16px;
    justify-content: end;
  }
</style>
