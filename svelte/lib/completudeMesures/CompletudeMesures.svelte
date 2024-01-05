<script lang="ts">
  import { recupereCompletudeMesure } from './completudeMesure.api';
  import Confetti from './confetti/Confetti.svelte';

  export let progression: number;
  export let idService: string;

  const taille = 100;
  const tailleCercle = taille * 0.85;
  const perimetreCercle = 2 * Math.PI * (tailleCercle / 2);

  let lanceAnimation = false;

  const metAJourCompletude = async () => {
    let avant = progression;
    progression = await recupereCompletudeMesure(idService);
    lanceAnimation = progression > avant;
  };
</script>

<svelte:body on:mesure-modifiee={metAJourCompletude} />

<div
  class="conteneur-jauge-progression"
  class:animationCompletude={lanceAnimation}
>
  {#if lanceAnimation}
    {#key progression}
      {#each new Array(30).fill(0) as _}
        <Confetti />
      {/each}
    {/key}
  {/if}
  <div class="cartouche-progression-mesures">des mesures renseignées</div>
  <svg class="jauge-progression-mesures" viewBox="0 0 {taille} {taille}">
    <circle
      id="cercle-fond"
      cx={taille / 2}
      cy={taille / 2}
      r={tailleCercle / 2}
      fill="white"
      stroke="#DBEEFF"
      stroke-width="4"
    />
    <circle
      id="cercle-progression"
      cx={taille / 2}
      cy={taille / 2}
      r={tailleCercle / 2}
      fill="none"
      stroke="#0079D0"
      stroke-width="6"
      stroke-linecap="round"
      transform="rotate(90 {taille / 2} {taille / 2})"
      stroke-dasharray="{(progression * perimetreCercle) /
        100} {perimetreCercle}"
    />
    <text
      x={taille / 2}
      y={taille / 2 + 8}
      text-anchor="middle"
      fill="#0C5C98"
      font-weight="bold"
      font-size="{taille * 0.22}px"
    >
      {progression} %
    </text>
  </svg>
</div>

<style>
  .jauge-progression-mesures {
    width: 4.2em;
    height: 4.2em;
  }

  .conteneur-jauge-progression {
    display: flex;
    flex-direction: row;
    gap: 0;
    align-items: center;
    user-select: none;
    position: relative;
  }

  .conteneur-jauge-progression .cartouche-progression-mesures {
    border-radius: 8px;
    background: #f1f5f9;
    padding: 8px 12px 8px 68px;
    color: #08416a;
    font-weight: 500;
    white-space: nowrap;
  }

  .conteneur-jauge-progression .jauge-progression-mesures {
    position: absolute;
    left: 5px;
  }

  .animationCompletude {
    --duree-animation: 1000ms;
    --type-animation: ease-in-out;
  }

  .animationCompletude .cartouche-progression-mesures {
    animation: fond-vert-pale var(--duree-animation) var(--type-animation);
  }

  .animationCompletude #cercle-progression {
    animation: couleur-svg-vert-fonce var(--duree-animation)
      var(--type-animation);
  }

  .animationCompletude text {
    animation: fond-svg-vert-fonce var(--duree-animation) var(--type-animation);
  }

  @keyframes fond-vert-pale {
    0% {
      background: #f1f5f9;
      box-shadow: 0 0 50px 10px rgba(212, 244, 219, 0);
    }
    50% {
      background: #d4f4db;
      box-shadow: 0 0 50px 10px rgba(212, 244, 219, 1);
    }
    100% {
      background: #f1f5f9;
      box-shadow: 0 0 50px 10px rgba(212, 244, 219, 0);
    }
  }

  @keyframes couleur-svg-vert-fonce {
    0% {
      stroke: #0079d0;
    }
    50% {
      stroke: #0e972b;
    }
    100% {
      stroke: #0079d0;
    }
  }

  @keyframes fond-svg-vert-fonce {
    0% {
      fill: #0079d0;
    }
    50% {
      fill: #0e972b;
    }
    100% {
      fill: #0079d0;
    }
  }
</style>
