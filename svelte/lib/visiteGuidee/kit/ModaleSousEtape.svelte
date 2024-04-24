<script lang="ts">
  import { visiteGuidee } from '../visiteGuidee.store';

  export let positionCible: DOMRect;
  export let titre: string;
  export let description: string;
</script>

<div
  class="rond"
  style="top: {positionCible?.top +
    positionCible?.height / 2 -
    9}px ; left: {positionCible?.right - 9}px"
/>

<div
  class="conteneur-modale"
  style="top: {positionCible?.top +
    positionCible?.height / 2}px ; left: {positionCible?.right + 7}px"
>
  <button class="bouton-fermeture" on:click={visiteGuidee.masqueEtapeCourant}>
    Fermer
  </button>
  <h2>{titre}</h2>
  <p>{description}</p>
  <div class="conteneur-actions">
    <button class="bouton suivant" on:click={visiteGuidee.etapeSuivante}
      >Suivant</button
    >
    <button
      class="bouton-tertiaire bouton"
      on:click={visiteGuidee.fermeDefinitivementVisiteGuidee}
      >Ne plus voir ces astuces</button
    >
  </div>
</div>

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
    padding: 12px 40px;
    position: fixed;
    width: 462px;
    transform: translateY(-50%);
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
  }

  .conteneur-modale:before {
    content: '';
    width: 14px;
    height: 14px;
    background: white;
    transform: rotate(45deg);
    position: absolute;
    left: -5px;
    top: calc(50% - 7px);
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
</style>
