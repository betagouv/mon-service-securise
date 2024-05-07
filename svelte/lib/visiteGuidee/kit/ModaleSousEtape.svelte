<script lang="ts">
  import { visiteGuidee } from '../visiteGuidee.store';
  import { onDestroy, onMount } from 'svelte';
  import Confetti from '../../ui/Confetti.svelte';
  import type { PositionRond, SousEtape } from './ModaleSousEtape.d';

  export let sousEtapes: SousEtape[];

  const rideau = document.getElementById('visite-guidee-rideau')!;
  let indexEtapeCourante = 0;

  let positionCible: DOMRect;
  let positionModale: {
    top: string;
    left: string;
    transformY: string;
    transformX: string;
    positionRond: PositionRond;
    leftPointe: string;
  };
  let sousEtape: SousEtape;
  let afficheModale = true;
  $: {
    afficheModale = false;
    sousEtape?.callbackFinaleCible?.(sousEtape.cible);
    sousEtape = sousEtapes[indexEtapeCourante];
    sousEtape.callbackInitialeCible?.(sousEtape.cible);
    setTimeout(() => {
      positionCible = sousEtape.cible.getBoundingClientRect();
      calculePolygone();
      afficheModale = true;
    }, sousEtape.delaiAvantAffichage ?? 0);
  }

  $: {
    if (sousEtape && positionCible) {
      switch (sousEtape.positionnementModale) {
        case 'MilieuDroite':
          positionModale = {
            top: `${positionCible.top + positionCible.height / 2}px`,
            left: `${positionCible.right + 7}px`,
            transformY: '50%',
            transformX: '0',
            positionRond: 'Droite',
            leftPointe: '0%',
          };
          break;
        case 'HautDroite':
          positionModale = {
            top: `${positionCible.top + positionCible.height / 2}px`,
            left: `${positionCible.right + 7}px`,
            transformY: '20%',
            transformX: '0',
            positionRond: 'Droite',
            leftPointe: '0%',
          };
          break;
        case 'BasDroite':
          positionModale = {
            top: `${positionCible.top + positionCible.height / 2}px`,
            left: `${positionCible.right + 7}px`,
            transformY: '80%',
            transformX: '0',
            positionRond: 'Droite',
            leftPointe: '0%',
          };
          break;
        case 'MilieuGauche':
          positionModale = {
            top: `${positionCible.top + positionCible.height / 2}px`,
            left: `${positionCible.right - positionCible.width - 7}px`,
            transformY: '50%',
            transformX: '-100%',
            positionRond: 'Gauche',
            leftPointe: '100%',
          };
          break;
        case 'HautGauche':
          positionModale = {
            top: `${positionCible.top + positionCible.height / 2}px`,
            left: `${positionCible.right - positionCible.width - 7}px`,
            transformY: '20%',
            transformX: '-100%',
            positionRond: 'Gauche',
            leftPointe: '100%',
          };
          break;
        case 'BasGauche':
          positionModale = {
            top: `${positionCible.top + positionCible.height / 2}px`,
            left: `${positionCible.right - positionCible.width - 7}px`,
            transformY: '80%',
            transformX: '-100%',
            positionRond: 'Gauche',
            leftPointe: '100%',
          };
          break;
        case 'BasMilieu':
          positionModale = {
            top: `${positionCible.bottom + 7}px`,
            left: `${positionCible.right - positionCible.width / 2}px`,
            transformY: '0%',
            transformX: '-50%',
            positionRond: 'Bas',
            leftPointe: '50%',
          };
          break;
      }
    }
  }

  $: estDerniereSousEtape = indexEtapeCourante === sousEtapes.length - 1;
  $: estPremiereSousEtape = indexEtapeCourante === 0;

  $: if (!afficheModale) rideau.style.clipPath = 'none';
  const calculePolygone = () => {
    if (!positionCible || !sousEtape) return;
    positionCible = sousEtape.cible.getBoundingClientRect();
    let { left, top, right, bottom } = positionCible;
    if (sousEtape.margeElementMisEnAvant) {
      left -= sousEtape.margeElementMisEnAvant;
      right += sousEtape.margeElementMisEnAvant;
      bottom += sousEtape.margeElementMisEnAvant;
      top -= sousEtape.margeElementMisEnAvant;
    }
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

  let decallageRond: { top: number; left: number };
  $: {
    if (positionModale) {
      switch (positionModale.positionRond) {
        case 'Gauche':
          decallageRond = {
            top: positionCible.top + positionCible.height / 2 - 9,
            left: positionCible.left - 9,
          };
          break;
        case 'Droite':
          decallageRond = {
            top: positionCible.top + positionCible.height / 2 - 9,
            left: positionCible.right - 9,
          };
          break;
        case 'Bas':
          decallageRond = {
            top: positionCible.bottom - 9,
            left: positionCible.left + positionCible.width / 2 - 9,
          };
          break;
      }
    }
  }

  onMount(() => calculePolygone());

  onDestroy(() => {
    sousEtape?.callbackFinaleCible?.(sousEtape.cible);
    rideau.style.clipPath = 'none';
  });
</script>

<svelte:window on:resize={calculePolygone} on:load={calculePolygone} />
{#if sousEtape && positionCible && afficheModale}
  <div
    class="rond"
    style="top: {decallageRond.top}px ; left: {decallageRond.left}px"
  />
  <div
    class="conteneur-modale"
    style="--top: {positionModale.top}; --left: {positionModale.left}; --transformY: {positionModale.transformY}; --transformX: {positionModale.transformX}; --left-pointe: {positionModale.leftPointe}"
  >
    <button
      class="bouton-fermeture"
      on:click={async () => await visiteGuidee.masqueEtapeCourante()}
    >
      Fermer
    </button>
    <h2>{sousEtape.titre}</h2>
    <p>{sousEtape.description}</p>
    {#if sousEtape.animation}
      <div class="conteneur-animation">
        <img src={sousEtape.animation} alt="" />
      </div>
    {/if}
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
        <div class="conteneur-navigation">
          {#if !estPremiereSousEtape}
            <button
              class="bouton bouton-tertiaire"
              on:click={() => indexEtapeCourante--}
            >
              Précédent
            </button>
          {/if}
          <button
            class="bouton suivant"
            class:derniereEtape={sousEtape?.texteBoutonDerniereEtape}
            on:click={async () =>
              sousEtape?.texteBoutonDerniereEtape
                ? await visiteGuidee.finalise()
                : estDerniereSousEtape
                ? await visiteGuidee.etapeSuivante()
                : indexEtapeCourante++}
          >
            {sousEtape?.texteBoutonDerniereEtape
              ? sousEtape.texteBoutonDerniereEtape
              : 'Suivant'}
            {#if sousEtape?.texteBoutonDerniereEtape}
              {#each new Array(50).fill(0) as _}
                <Confetti />
              {/each}
            {/if}
          </button>
        </div>
        {#if !sousEtape?.texteBoutonDerniereEtape}
          <button
            class="lien"
            on:click={async () =>
              await visiteGuidee.fermeDefinitivementVisiteGuidee()}
            >Je n’ai plus besoin d’aide</button
          >
        {/if}
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
    padding: 20px 40px;
    position: fixed;
    width: 462px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
    top: var(--top);
    left: var(--left);
    transform: translateY(calc(0% - var(--transformY)))
      translateX(var(--transformX));
  }

  .conteneur-modale:before {
    content: '';
    width: 14px;
    height: 14px;
    background: white;
    transform: rotate(45deg);
    position: absolute;
    left: calc(var(--left-pointe) - 7px);
    top: calc(var(--transformY) - 7px);
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

  .suivant:not(.derniereEtape):after {
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
    padding: 4px 0 4px 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .bouton-fermeture:hover {
    text-decoration: underline;
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
    padding-top: 14px;
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

  .conteneur-navigation {
    display: flex;
    gap: 16px;
  }

  .lien {
    color: var(--bleu-mise-en-avant);
    padding: 8px 0;
    background: none;
    border: none;
    cursor: pointer;
  }

  .lien:hover {
    text-decoration: underline;
  }
</style>
