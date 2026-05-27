<script lang="ts">
  import type { ConseilsCyberProps } from './conseilsCyber.types';
  import { untrack } from 'svelte';

  let { categories, donneesArticles, sectionSelectionnee }: ConseilsCyberProps =
    $props();

  const optionsFiltrage = $derived([
    { label: 'Tous les articles', value: 'tous' },
    ...Object.entries(categories).map(([idCategorie, donnees]) => ({
      label: donnees.label,
      value: idCategorie,
    })),
  ]);

  let idCategorieChoisie = $state(untrack(() => sectionSelectionnee) || 'tous');

  let articlesVisibles = $derived(
    idCategorieChoisie === 'tous'
      ? donneesArticles
      : donneesArticles.filter((a) => a.idCategorie === idCategorieChoisie)
  );
</script>

<div class="liste-articles">
  <div class="conteneur-selection-categorie">
    <dsfr-select
      label="Sélectionner la catégorie"
      hideLabel
      options={optionsFiltrage}
      value={idCategorieChoisie}
      id="filtreArticles"
      onvaluechanged={(e: CustomEvent<string>) =>
        (idCategorieChoisie = e.detail)}
    >
    </dsfr-select>
  </div>
  <h2>
    {idCategorieChoisie === 'tous'
      ? 'Tous les articles'
      : categories[idCategorieChoisie].label}
  </h2>
  <div class="conteneur-articles">
    {#each articlesVisibles as article, index (index)}
      <dsfr-card
        title={article.titre}
        href={article.href}
        size="sm"
        has-badge
        enlarge
      >
        <div slot="badgesgroup">
          <dsfr-badge
            size="sm"
            accent={categories[article.idCategorie].accent}
            label={categories[article.idCategorie].label}
            type="accent"
          ></dsfr-badge>
        </div>
      </dsfr-card>
    {/each}
  </div>
</div>

<style lang="scss">
  .conteneur-selection-categorie {
    max-width: 400px;
  }

  .liste-articles {
    padding: 48px 16px;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 32px;

    h2 {
      margin: 0;
      font-size: 1.75rem;
      font-style: normal;
      font-weight: 700;
      line-height: 2.25rem;
    }

    .conteneur-articles {
      gap: 16px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));
    }
  }
</style>
