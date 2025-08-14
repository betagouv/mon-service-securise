<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let apiGetProgression: () => Promise<number>;
  export let delaiRafraichissement = 1_000;

  const dispatch = createEventDispatcher<{ fini: null }>();
  let elementModale: HTMLDialogElement;
  let progression = 0;

  async function monitoreProgression() {
    try {
      progression = await apiGetProgression();

      if (progression === 100) dispatch('fini');
      else setTimeout(monitoreProgression, delaiRafraichissement);
    } catch (e) {
      setTimeout(monitoreProgression, 5_000);
      return;
    }
  }

  onMount(async () => {
    await monitoreProgression();

    // Lorsque le process monitoré est très rapide, il se peut que la modale
    // soit montée puis supprimée très vite. Sans `if`, ce cas provoque une
    // erreur.
    if (elementModale) {
      elementModale.inert = true;
      elementModale.showModal();
      elementModale.inert = false;
    }
  });
</script>

<dialog bind:this={elementModale}>
  <div class="conteneur-modale">
    <div class="conteneur-progression">
      <div class="texte-progression">
        <h2>
          Téléversement en cours... <span class="pourcentage-progression"
            >{progression}%</span
          >
        </h2>
        <span>Merci de ne pas rafraichir votre navigateur</span>
      </div>
      <progress value={progression} max="100" />
    </div>
  </div>
</dialog>

<style lang="scss">
  dialog {
    width: 556px;
    height: fit-content;
    padding: 48px 32px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
    box-sizing: border-box;
    position: relative;

    &::backdrop {
      background: rgba(22, 22, 22, 0.64);
    }
  }
  .conteneur-modale {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }

  .conteneur-progression {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    gap: 16px;

    .texte-progression {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      span {
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5rem;
      }

      h2 {
        margin-bottom: 8px;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 2rem;

        span {
          margin-bottom: 8px;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 2rem;
          color: #137bcd;
        }
      }
    }

    progress {
      width: 100%;
      margin: 24px 0;
      height: 15px;
      border-radius: 95px;
      border: none;
      accent-color: var(--bleu-mise-en-avant);
      background-color: var(--cyan-clair);
      -webkit-appearence: none;
      appearance: none;
      overflow: hidden;

      &::-webkit-progress-bar {
        background-color: var(--cyan-clair);
      }

      &::-webkit-progress-value {
        background-color: var(--bleu-mise-en-avant);
      }

      &::-moz-progress-bar {
        background-color: var(--bleu-mise-en-avant);
      }
    }
  }
</style>
