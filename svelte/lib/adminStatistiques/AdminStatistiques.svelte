<script lang="ts">
  import '@gouvfr/dsfr-chart';
  import '@gouvfr/dsfr-chart/css';
  import { onMount } from 'svelte';
  import { api } from './adminStatistiques.api';
  import type {
    ReferentielStatistiques,
    Statistiques,
  } from './adminStatistiques.types';
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite';
  import PieChart from './charts/PieChart.svelte';

  interface Props {
    referentiel: ReferentielStatistiques;
  }

  let { referentiel }: Props = $props();

  let statistiques: Statistiques | undefined = $state();

  onMount(async () => {
    statistiques = await api.statistiques();
  });

  let parNiveauDeSecurite = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.servicesParNiveauSecurite;
    return {
      x: Object.keys(donnees).map(
        (niveau) =>
          donneesNiveauxDeSecurite.find((n) => n.id === niveau)?.nom as string
      ),
      y: Object.values(donnees),
    };
  });

  let parType = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.servicesParType;
    return {
      x: Object.keys(donnees).map((type) => referentiel.typesService[type]),
      y: Object.values(donnees),
    };
  });
</script>

<h1>Statistiques</h1>
<div class="grille-graphiques">
  <PieChart
    titre="Besoins de sécurité"
    x={parNiveauDeSecurite.x}
    y={parNiveauDeSecurite.y}
    unite="services"
  />
  <PieChart
    titre="Types de services"
    x={parType.x}
    y={parType.y}
    unite="services"
  />
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
