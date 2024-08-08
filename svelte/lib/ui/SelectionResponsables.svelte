<script lang="ts">
  import type { ResponsableMesure } from '../tableauDesMesures/tableauDesMesures.d';
  import MenuFlottant from './MenuFlottant.svelte';
  import { contributeurs } from '../tableauDesMesures/stores/contributeurs.store';
  import { createEventDispatcher } from 'svelte';

  export let responsables: ResponsableMesure[] | null;
  export let estLectureSeule: boolean;

  let menuOuvert = false;

  const dispatch = createEventDispatcher<{
    modificationResponsables: { responsables: ResponsableMesure[] };
  }>();
  const modifieResponsables = () => {
    if (responsables) dispatch('modificationResponsables', { responsables });
  };

  const ouvreTiroirContributeurs = () => {
    menuOuvert = false;
    document.body.dispatchEvent(
      new CustomEvent('jquery-affiche-tiroir-contributeurs')
    );
  };
</script>

<MenuFlottant bind:menuOuvert {estLectureSeule} stopPropagation>
  <div slot="declencheur" class="bouton-declencheur" class:estLectureSeule>
    <div class="conteneur-image">
      <img src="/statique/assets/images/icone_utilisateur_trait.svg" alt="" />
    </div>
    <span>{responsables?.length || 0}</span>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="conteneur-responsables" on:click|stopPropagation>
    <div class="entete">
      <span class="titre">Attribuer une mesure</span>
      <button class="fermeture" on:click={() => (menuOuvert = false)}>✕</button>
    </div>
    <div>
      {#each $contributeurs as contributeur (contributeur.id)}
        <div class="conteneur-contributeur">
          <div class="conteneur-nom">
            <span class="initiales">
              {#if contributeur.initiales}
                {contributeur.initiales}
              {:else}
                <img
                  src="/statique/assets/images/icone_utilisateur_trait.svg"
                  alt=""
                />
              {/if}
            </span>
            <span class="nom-contributeur">{contributeur.prenomNom}</span>
          </div>
          <input
            type="checkbox"
            value={contributeur.id}
            class="checkbox-contributeur"
            bind:group={responsables}
            on:change={modifieResponsables}
          />
        </div>
      {/each}
    </div>
    <div class="pied-page">
      <button on:click={ouvreTiroirContributeurs}
        >Gerer les contributeurs</button
      >
      <span>pour modifier les droits ou ajouter des responsables.</span>
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
    width: 290px;
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
    padding: 8px 0;
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

  .conteneur-contributeur {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 9px 0;
    gap: 4px;
  }

  .conteneur-nom {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .initiales {
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--fond-bleu-pale);
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    border-radius: 50%;
  }

  .nom-contributeur {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 224px;
  }

  .checkbox-contributeur {
    margin: 0;
  }

  .pied-page {
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--texte-clair);
  }

  .pied-page button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--bleu-mise-en-avant);
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    text-decoration-line: underline;
  }
</style>
