<script lang="ts">
  import '@gouvfr/dsfr-chart';
  import '@gouvfr/dsfr-chart/css';

  import { onMount } from 'svelte';
  import { api } from './adminStatistiques.api';
  import type { Statistiques } from './adminStatistiques.types';
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite';

  let statistiques: Statistiques | undefined = $state();

  onMount(async () => {
    statistiques = await api.statistiques();
  });

  let parNiveauDeSecurite = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.servicesParNiveauSecurite;
    return {
      x: Object.keys(donnees).map(
        (niveau) => donneesNiveauxDeSecurite.find((n) => n.id === niveau)?.nom
      ),
      y: Object.values(donnees),
    };
  });

  let parType = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.servicesParType;
    return {
      x: Object.keys(donnees),
      y: Object.values(donnees),
    };
  });
</script>

<h1>Statistiques</h1>
<div class="grille-graphiques">
  <div class="graphique">
    <h2>Besoins de sécurité</h2>
    <pie-chart
      x={JSON.stringify([parNiveauDeSecurite.x])}
      y={JSON.stringify([parNiveauDeSecurite.y])}
      name={JSON.stringify(parNiveauDeSecurite.x)}
      unit-tooltip="services"
      selected-palette="categorical"
    ></pie-chart>
  </div>
  <div class="graphique">
    <h2>Types de services</h2>
    <pie-chart
      x={JSON.stringify([parType.x])}
      y={JSON.stringify([parType.y])}
      name={JSON.stringify(parType.x)}
      unit-tooltip="services"
      selected-palette="categorical"
    ></pie-chart>
  </div>
</div>

<style lang="scss">
  :global(#conteneur-admin-statistiques) {
    text-align: left;
    background: #fff;
    width: 100%;
    padding: 32px 20px;
    overflow: auto;
  }

  :global(main) {
    background: white;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }

  .grille-graphiques {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px 0;
    box-sizing: border-box;

    .graphique {
      border: 1px solid var(--liseres-fonce);
      padding: 16px;

      h2 {
        margin: 0 0 24px;
      }
    }

    /* Les graphiques DSFR se mettent en page en supposant le reset et les classes
       utilitaires du DSFR, que MSS ne charge pas. On les redéfinit ici, à l'identique,
       plutôt que d'importer dsfr.min.css dont le reset s'appliquerait à tout le site.
       Sans le reset, la marge par défaut du navigateur sur `p` désaligne les pastilles
       de la légende, et le `content-box` fait déborder l'en-tête des infobulles de la
       largeur de son padding. */
    :global {
      *,
      ::before,
      ::after {
        box-sizing: inherit;
      }

      p {
        margin: var(--text-spacing, 0 0 1.5rem);
      }

      .fr-grid-row {
        display: flex;
        flex-wrap: wrap;
        margin: 0;
        padding: 0;
      }

      .fr-col-12 {
        flex: 0 0 100%;
        max-width: 100%;
        width: 100%;
      }

      .fr-mb-0 {
        margin-bottom: 0;
      }

      .fr-mb-1v {
        margin-bottom: 0.25rem;
      }

      .fr-ml-1w {
        margin-left: 0.5rem;
      }

      .fr-mt-3v {
        margin-top: 0.75rem;
      }

      .fr-mt-4v {
        margin-top: 1rem;
      }

      .fr-text--bold {
        font-weight: 700;
      }

      .fr-text--sm {
        font-size: 0.875rem;
        line-height: 1.5rem;
      }
    }
  }
</style>
