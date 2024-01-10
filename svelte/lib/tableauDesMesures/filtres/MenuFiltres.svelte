<script lang="ts">
  import MenuFlottant from '../../ui/MenuFlottant.svelte';
  import type { IdCategorie, IdStatut } from '../tableauDesMesures.d';
  import {
    nombreResultats,
    rechercheCategorie,
    rechercheStatut,
  } from '../tableauDesMesures.store';

  export let categories: Record<IdCategorie, string>;
  export let statuts: Record<IdStatut, string>;

  const effaceFiltres = () => {
    rechercheCategorie.set([]);
    rechercheStatut.set([]);
  };
</script>

<MenuFlottant>
  <div slot="declencheur">
    <button class="bouton bouton-secondaire bouton-filtre">
      <img src="/statique/assets/images/icone_filtre.svg" alt="" />
      Filtres
    </button>
  </div>

  <div class="filtres-disponibles">
    <div class="titre-filtres">
      <img src="/statique/assets/images/icone_filtre.svg" alt="" />
      Filtres
    </div>
    <fieldset>
      <legend>Catégories de cybersécurité</legend>
      {#each Object.entries(categories) as [id, categorie]}
        <div>
          <input
            type="checkbox"
            {id}
            name={id}
            bind:group={$rechercheCategorie}
            value={id}
          />
          <label for={id}>{categorie}</label>
        </div>
      {/each}
    </fieldset>
    <fieldset>
      <legend>Statut</legend>
      {#each Object.entries( { ...statuts, nonRenseignee: 'Non renseignée' } ) as [id, statut]}
        <div>
          <input
            type="checkbox"
            {id}
            name={id}
            bind:group={$rechercheStatut}
            value={id}
          />
          <label for={id}>{statut}</label>
        </div>
      {/each}
    </fieldset>
    <button
      class="bouton bouton-secondaire bouton-effacer-filtre"
      on:click={effaceFiltres}
    >
      Effacer les filtres
    </button>
  </div>
</MenuFlottant>
<p
  class="nombre-resultat"
  class:visible={$nombreResultats.aDesFiltresAppliques}
>
  <strong>{$nombreResultats.filtrees}&nbsp;</strong
  >/&nbsp;{$nombreResultats.total} mesures affichées
</p>

<style>
  .bouton-filtre {
    display: flex;
    gap: 8px;
  }

  .titre-filtres {
    display: flex;
    gap: 8px;
    padding: calc(0.5em + 1px) calc(1em - 16px + 1px);
    font-weight: 500;
    color: #08416a;
    margin-bottom: 8px;
  }

  .titre-filtres img {
    filter: brightness(0) invert(16%) sepia(87%) saturate(1447%)
      hue-rotate(183deg) brightness(91%) contrast(94%);
  }

  .filtres-disponibles {
    width: 260px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: white;
    padding: 0 16px 24px 16px;
  }

  .filtres-disponibles fieldset {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    margin: 0 0 24px;
  }

  :global(.svelte-menu-flottant) {
    transform: translate(0, -1px) !important;
  }

  .bouton-effacer-filtre {
    margin-top: 8px;
  }

  .nombre-resultat {
    color: #0079d0;
    opacity: 0;
  }

  .nombre-resultat.visible {
    opacity: 1;
  }

  .bouton {
    margin: 0;
    padding: 0.5em 1em;
    font-weight: 500;
  }
</style>
