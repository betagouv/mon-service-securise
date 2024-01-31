<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Etape } from './decouverteFonctionnalite.d';
  import { get_current_component } from 'svelte/internal';

  export let cible: HTMLElement;
  export let etapes: Etape[];

  let etapeCourante = 0;

  let rect = cible.getBoundingClientRect();

  let valeursInitiales = {
    zIndex: cible.style.zIndex,
    background: cible.style.background,
  };
  onMount(() => {
    cible.style.zIndex = '999';
    cible.style.background = 'white';
  });

  onDestroy(() => {
    cible.style.zIndex = valeursInitiales.zIndex;
    cible.style.background = valeursInitiales.background;
  });

  const ceComposant = get_current_component();
  const slideSuivante = () => {
    if (etapeCourante + 1 >= etapes.length) {
      ceComposant.$destroy();
    }
    etapeCourante++;
  };

  $: {
    const etape = etapes[etapeCourante];
    if (etape.action && etape.cibleAction) {
      if (etape.action === 'click') {
        etape.cibleAction.click();
        rect = cible.getBoundingClientRect();
      } else if (etape.action === 'input') {
        const input = etape.cibleAction as HTMLInputElement;
        input.select();
        input.value = '';
        let indexCourant = 0;
        const l = etape.donneesAction.length;

        const ecrisUneLettre = () => {
          input.value += etape.donneesAction[indexCourant];
          if (indexCourant < l - 1) {
            indexCourant++;
            setTimeout(function () {
              ecrisUneLettre();
            }, 300);
          } else {
            input.setAttribute('value', input.value);
          }
        };

        setTimeout(ecrisUneLettre, 300);
      }
    }
  }
</script>

<div class="conteneur-superposition">
  <button
    class="decouverte-fonctionnalite"
    style="top: {rect.top}px; left: {rect.left}px;"
    on:click={slideSuivante}
  >
    <span>{etapes[etapeCourante].texte}</span>
  </button>
</div>

<style>
  .conteneur-superposition {
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .decouverte-fonctionnalite {
    position: fixed;
    background: #0a76f6;
    border-radius: 8px;
    padding: 16px 64px 16px 16px;
    color: white;
    font-weight: 500;
    min-width: 300px;
    transform: translateX(-110%);
    animation: 0.6s ease-in-out infinite alternate slide;
    cursor: pointer;
    border: none;
    text-align: left;
    outline: none;
  }

  .decouverte-fonctionnalite::after {
    content: '';
    width: 24px;
    height: 24px;
    display: flex;
    background: url('/statique/assets/images/forme_chevron_bleu.svg') no-repeat;
    background-size: contain;
    position: absolute;
    right: 16px;
    top: calc(50% - 12px);
    filter: brightness(0) invert(100%);
  }

  @keyframes slide {
    from {
      transform: translateX(-110%);
    }
    to {
      transform: translateX(-115%);
    }
  }
</style>
