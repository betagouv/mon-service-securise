<script lang="ts">
  import '@gouvfr/dsfr-chart';
  import '@gouvfr/dsfr-chart/css';
  import { onMount } from 'svelte';
  import type {
    DonneesObservatoire,
    FiltresObservatoire,
  } from './observatoire.d';
  import { api } from './observatoire.api';
  import CarteObservatoire from './CarteObservatoire.svelte';
  import Loader from '../ui/Loader.svelte';

  let donnees = $state.raw<DonneesObservatoire>();

  const chargeDonnees = async (filtres: FiltresObservatoire = {}) => {
    donnees = await api.donnees(filtres);
  };

  onMount(() => chargeDonnees());

  let dateDonnees = $derived(
    donnees?.dateDerniereExecution
      ? new Date(donnees.dateDerniereExecution).toLocaleDateString('fr-FR')
      : undefined
  );

  const formatMois = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: '2-digit',
  });
  const enLibelleMois = (mois: string) =>
    formatMois.format(new Date(`${mois}-01T00:00:00`));
  const enChiffre = (nombre: number) => Number(nombre).toLocaleString('fr-FR');

  let totalServices = $derived(donnees?.totalServices ?? 0);
  let cumulMensuelServices = $derived(donnees?.cumulMensuelServices ?? []);
  let mesuresFaitesParMois = $derived(donnees?.mesuresFaitesParMois ?? []);
  let servicesParNiveauSecurite = $derived(
    donnees?.servicesParNiveauSecurite ?? []
  );
  let cumulMensuelHomologations = $derived(
    donnees?.cumulMensuelHomologations ?? []
  );

  let moisServices = $derived(
    cumulMensuelServices.map(({ mois }) => enLibelleMois(mois))
  );
  let cumulsServices = $derived(cumulMensuelServices.map(({ cumul }) => cumul));

  let moisMesuresFaites = $derived(
    mesuresFaitesParMois.map(({ mois }) => enLibelleMois(mois))
  );
  let totauxMesuresFaites = $derived(
    mesuresFaitesParMois.map(({ total }) => total)
  );
  let totalMesuresFaitesADate = $derived(totauxMesuresFaites.at(-1) ?? 0);

  let niveauxSecurite = $derived(
    servicesParNiveauSecurite.map(({ niveauSecurite }) => niveauSecurite)
  );
  let servicesParNiveau = $derived(
    servicesParNiveauSecurite.map(({ total }) => total)
  );

  let moisHomologations = $derived(
    cumulMensuelHomologations.map(({ mois }) => enLibelleMois(mois))
  );
  let cumulsHomologations = $derived(
    cumulMensuelHomologations.map(({ cumul }) => cumul)
  );
  let totalHomologationsADate = $derived(cumulsHomologations.at(-1) ?? 0);
</script>

{#snippet chiffreCle(chiffre: number)}
  <p class="chiffre-cle">{enChiffre(chiffre)}</p>
{/snippet}

{#snippet evolutionMensuelle(
  x: string[],
  y: number[],
  nom: string,
  unite: string
)}
  <line-chart
    x={JSON.stringify([x])}
    y={JSON.stringify([y])}
    name={JSON.stringify([nom])}
    unit-tooltip={unite}
    selected-palette="categorical"
  ></line-chart>
{/snippet}

<div class="observatoire">
  <h1>Projets</h1>
  <p>
    La sécurisation et l’homologation des systèmes d’information dans le secteur
    public.
  </p>

  {#if !donnees}
    <Loader />
  {:else}
    <div class="ligne">
      <CarteObservatoire titre="Systèmes d’information sécurisés" {dateDonnees}>
        {@render chiffreCle(totalServices)}
      </CarteObservatoire>
      <CarteObservatoire titre="Évolution par mois (cumul)" {dateDonnees}>
        {@render evolutionMensuelle(
          moisServices,
          cumulsServices,
          'SI sécurisés',
          'SI'
        )}
      </CarteObservatoire>
    </div>

    <CarteObservatoire
      titre="Répartition par besoins de sécurité des projets"
      {dateDonnees}
    >
      <div class="camembert">
        <pie-chart
          x={JSON.stringify([niveauxSecurite])}
          y={JSON.stringify([servicesParNiveau])}
          name={JSON.stringify(niveauxSecurite)}
          unit-tooltip="services"
          selected-palette="categorical"
          fill="true"
        ></pie-chart>
      </div>
    </CarteObservatoire>

    <div class="ligne">
      <CarteObservatoire titre="Faiblesses corrigées" {dateDonnees}>
        {@render chiffreCle(totalMesuresFaitesADate)}
      </CarteObservatoire>
      <CarteObservatoire titre="Évolution par mois (cumul)" {dateDonnees}>
        {@render evolutionMensuelle(
          moisMesuresFaites,
          totauxMesuresFaites,
          'Mesures faites',
          'mesures'
        )}
      </CarteObservatoire>
    </div>

    <div class="ligne">
      <CarteObservatoire titre="Homologations réalisées" {dateDonnees}>
        {@render chiffreCle(totalHomologationsADate)}
      </CarteObservatoire>
      <CarteObservatoire titre="Évolution par mois (cumul)" {dateDonnees}>
        {@render evolutionMensuelle(
          moisHomologations,
          cumulsHomologations,
          'Homologations',
          'homologations'
        )}
      </CarteObservatoire>
    </div>
  {/if}
</div>

<style lang="scss">
  .observatoire {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 16px;
    background: #f6f6f6;
    text-align: left;

    h1 {
      margin: 0;
    }
  }

  .ligne {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .chiffre-cle {
    margin: 0;
    color: #161616;
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 3rem;
  }

  .camembert {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
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
</style>
