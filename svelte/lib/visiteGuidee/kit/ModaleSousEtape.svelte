<script lang="ts">
  import { visiteGuidee } from '../visiteGuidee.store';
  import { onMount } from 'svelte';

  type PositionModale = 'MilieuDroite' | 'HautDroite';
  type SousEtape = {
    cible: HTMLElement;
    callbackInitialeCible: (cible: HTMLElement) => void;
    positionnementModale: PositionModale;
    titre: string;
    description: string;
    animation: string;
  };
  export let sousEtapes: SousEtape[];

  const rideau = document.getElementById('visite-guidee-rideau')!;
  let indexEtapeCourante = 0;

  let positionCible: DOMRect;
  let positionModale: { top: string; left: string; transform: string };
  let sousEtape: SousEtape;
  $: {
    sousEtape = sousEtapes[indexEtapeCourante];
    sousEtape.callbackInitialeCible(sousEtape.cible);
    positionCible = sousEtape.cible.getBoundingClientRect();
    calculePolygone();
  }

  $: {
    if (sousEtape) {
      switch (sousEtape.positionnementModale) {
        case 'MilieuDroite':
          positionModale = {
            top: `${positionCible.top + positionCible.height / 2}px`,
            left: `${positionCible.right + 7}px`,
            transform: '50%',
          };
          break;
        case 'HautDroite':
          positionModale = {
            top: `${positionCible.top + positionCible.height / 2}px`,
            left: `${positionCible.right + 7}px`,
            transform: '10%',
          };
          break;
      }
    }
  }

  $: estDernierSousEtape = indexEtapeCourante === sousEtapes.length - 1;

  const calculePolygone = () => {
    let { left, top, right, bottom } = positionCible;
    left -= 20;
    right += 20;
    bottom += 20;
    top -= 30;
    rideau.style.clipPath = `polygon(
            0% 0%,
            0% 100%,
            ${left}px 100%,
            ${left}px ${top}px,
            ${right}px ${top}px,
            ${right}px ${bottom}px,
            ${left}px ${bottom}px,
            ${left}px 100%,
            100% 100%,
            100% 0%
        )`;
  };

  onMount(() => calculePolygone());
</script>

<svelte:window on:resize={calculePolygone} on:load={calculePolygone} />
{#if sousEtape}
  <div
    class="rond"
    style="top: {positionCible?.top +
      positionCible?.height / 2 -
      9}px ; left: {positionCible?.right - 9}px"
  />
  <div
    class="conteneur-modale"
    style="--top: {positionModale.top}; --left: {positionModale.left}; --transform: {positionModale.transform}"
  >
    <button class="bouton-fermeture" on:click={visiteGuidee.masqueEtapeCourant}>
      Fermer
    </button>
    <h2>{sousEtape.titre}</h2>
    <p>{sousEtape.description}</p>
    <div class="conteneur-animation">
      <img src={sousEtape.animation} alt="" />
    </div>
    <div class="conteneur-pied-page">
      <div class="conteneur-pagination">
        {#each new Array(sousEtapes.length) as _, idx (idx)}
          <button
            class="pagination-etape"
            class:etape-courante={idx === indexEtapeCourante}
            on:click={() => (indexEtapeCourante = idx)}
          ></button>
        {/each}
      </div>
      <div class="conteneur-actions">
        <button
          class="bouton suivant"
          on:click={() =>
            estDernierSousEtape
              ? visiteGuidee.etapeSuivante()
              : indexEtapeCourante++}
        >
          Suivant
        </button>
        <button
          class="bouton-tertiaire bouton"
          on:click={visiteGuidee.fermeDefinitivementVisiteGuidee}
          >Ne plus voir ces astuces</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  .rond {
    width: 18px;
    height: 18px;
    background: var(--violet-indice-cyber);
    opacity: 0.8;
    position: fixed;
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
    animation: pulse 2s infinite;
    transform: scale(1);
  }

  .conteneur-modale {
    color: var(--gris-fonce);
    border-radius: 4px;
    background: white;
    padding: 12px 40px 32px 40px;
    position: fixed;
    width: 462px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
    top: var(--top);
    left: var(--left);
    transform: translateY(calc(0% - var(--transform)));
  }

  .conteneur-modale:before {
    content: '';
    width: 14px;
    height: 14px;
    background: white;
    transform: rotate(45deg);
    position: absolute;
    left: -5px;
    top: calc(var(--transform) - 7px);
  }

  .conteneur-modale h2 {
    color: var(--bleu-anssi);
  }

  .conteneur-actions {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 8px;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(112, 37, 218, 0.5);
    }

    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(112, 37, 218, 0);
    }

    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(112, 37, 218, 0);
    }
  }

  button {
    cursor: pointer;
    width: fit-content;
    margin: 0;
    padding: 8px 20px;
  }

  .suivant {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  .suivant:after {
    --taille: 16px;
    content: '';
    width: var(--taille);
    height: var(--taille);
    display: flex;
    background: url('/statique/assets/images/forme_chevron_blanc.svg');
    background-size: var(--taille) var(--taille);
  }

  .bouton-fermeture {
    margin-left: auto;
    color: var(--bleu-mise-en-avant);
    background: transparent;
    border: none;
    padding: 4px 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .bouton-fermeture:after {
    background: url(/statique/assets/images/icone_fermeture_modale.svg);
    content: '';
    width: 16px;
    height: 16px;
    display: inline-block;
    filter: brightness(0) invert(28%) sepia(70%) saturate(1723%)
      hue-rotate(184deg) brightness(107%) contrast(101%);
    background-size: 16px;
    transform: translateY(3px);
  }

  .conteneur-animation {
    padding: 16px;
    background: var(--fond-bleu-pale);
    margin-bottom: 28px;
    margin-top: 24px;
  }

  .conteneur-animation img {
    width: 100%;
  }

  .conteneur-pied-page {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .conteneur-pagination {
    display: flex;
    gap: 8px;
  }

  .pagination-etape {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: flex;
    background: var(--liseres-fonce);
    padding: 0;
    border: none;
  }

  .pagination-etape.etape-courante {
    background: var(--bleu-mise-en-avant);
  }
</style>
