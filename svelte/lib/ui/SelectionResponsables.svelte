<script lang="ts">
  import type { ResponsableMesure } from '../tableauDesMesures/tableauDesMesures.d';
  import MenuFlottant from './MenuFlottant.svelte';

  export let responsables: ResponsableMesure[] | null;
  export let estLectureSeule: boolean;

  let menuOuvert = false;
</script>

<MenuFlottant {estLectureSeule} bind:menuOuvert>
  <div slot="declencheur" class="bouton-declencheur" class:estLectureSeule>
    <div class="conteneur-image">
      <img src="/statique/assets/images/icone_utilisateur_trait.svg" alt="" />
    </div>
    <span>{responsables?.length || 0}</span>
  </div>
  <div class="conteneur-responsables">
    <div class="entete">
      <span class="titre">Attribuer une mesure</span>
      <button class="fermeture" on:click={() => (menuOuvert = false)}>✕</button>
    </div>
  </div>
</MenuFlottant>

<style>
  .conteneur-responsables {
    border-radius: 6px;
    padding: 16px;
    border: 1px solid var(--liseres-fonce);
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: white;
    width: 274px;
  }

  .bouton-declencheur {
    background: var(--fond-gris-pale);
    border-radius: 25px;
    padding: 3px 6px;
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  .bouton-declencheur span {
    margin-right: 6px;
    font-size: 13px;
    font-weight: 500;
  }

  .bouton-declencheur.estLectureSeule span {
    color: var(--liseres-fonce);
  }

  .bouton-declencheur:not(.estLectureSeule):hover span {
    color: var(--bleu-anssi);
  }

  .conteneur-image {
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .conteneur-image img {
    margin: -3px;
  }

  .bouton-declencheur.estLectureSeule img {
    filter: brightness(0) invert(93%) sepia(5%) saturate(719%)
      hue-rotate(181deg) brightness(88%) contrast(100%);
  }

  .bouton-declencheur:not(.estLectureSeule):hover img {
    filter: brightness(0) invert(17%) sepia(79%) saturate(1068%)
      hue-rotate(177deg) brightness(101%) contrast(98%);
  }

  .entete {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
  }

  .entete .titre {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .entete .fermeture {
    font-size: 18px;
    color: var(--liseres-fonce);
    background: none;
    border: none;
    cursor: pointer;
  }

  .entete .fermeture:hover {
    color: var(--texte-fonce);
  }
</style>
