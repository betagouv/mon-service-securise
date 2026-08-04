<script lang="ts">
  import '@gouvfr/dsfr-chart';
  import '@gouvfr/dsfr-chart/css';
  import { onMount } from 'svelte';
  import { api } from './adminStatistiques.api';
  import { api as apiEntites } from '../adminEntites/adminEntites.api';
  import type {
    ReferentielStatistiques,
    Statistiques,
    TrancheExpirationHomologation,
  } from './adminStatistiques.types';
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite';
  import PieChart from './charts/PieChart.svelte';
  import LineChart from './charts/LineChart.svelte';
  import { singulierPluriel } from '../outils/string';
  import { CategorieMesure, type IdNiveauDeSecurite } from '../ui/types.d';
  import type { EntiteSupervisee } from '../adminEntites/adminEntites.types';
  import CarteChiffreCle from './CarteChiffreCle.svelte';
  import BarChart from './charts/BarChart.svelte';
  import type { StatutMesure } from '../modeles/modeleMesure';

  interface Props {
    referentiel: ReferentielStatistiques;
  }

  let { referentiel }: Props = $props();

  let statistiques: Statistiques | undefined = $state();
  let entites: Array<EntiteSupervisee> = $state([]);

  const rafraichisStatistiques = async () => {
    statistiques = await api.statistiques({
      filtreNiveauxSecurite,
      filtreEntites,
    });
  };

  onMount(async () => {
    await rafraichisStatistiques();
    entites = await apiEntites.entitesDansMonPerimetre();
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

  let parDateCreation = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.evolutionNombreServices;
    return {
      x: donnees.map((donnee) => donnee.mois),
      y: donnees.map((donnee) => donnee.total),
    };
  });

  let parDateHomologation = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.evolutionNombreHomologations;
    return {
      x: donnees.map((donnee) => donnee.mois),
      y: donnees.map((donnee) => donnee.total),
    };
  });

  let parEntite = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.evolutionNombreOrganisations;
    return {
      x: donnees.map((donnee) => donnee.mois),
      y: donnees.map((donnee) => donnee.total),
    };
  });

  let parTrancheIndiceCyber = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.servicesParTrancheIndiceCyber;
    return {
      x: Object.keys(donnees),
      y: Object.values(donnees),
    };
  });

  let parTrancheCompletude = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.servicesParTrancheCompletudeMesures;
    return {
      x: Object.keys(donnees),
      y: Object.values(donnees),
    };
  });

  let mesuresParCategorieEtStatut = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.nombreMesuresParStatutEtCategorie;
    const statuts = Object.keys(referentiel.statutsMesures);
    return {
      x: Object.keys(donnees).map(
        (c) => referentiel.categoriesMesures[c as CategorieMesure]
      ),
      y: Object.values(donnees).map((nombreMesuresParStatutPourCategorie) =>
        statuts.map(
          (s) => nombreMesuresParStatutPourCategorie[s as StatutMesure]
        )
      ),
      libelles: Object.values(referentiel.statutsMesures),
    };
  });

  const LIBELLES_TRANCHES_EXPIRATION: Record<
    TrancheExpirationHomologation,
    string
  > = {
    expire: 'Expirée',
    '< 6': 'Expire dans 6 mois',
    '< 12': 'Expire dans 1 an',
    '< 24': 'Expire dans 2 ans',
    '< 36': 'Expire dans 3 ans',
  };

  let parTrancheDureeExpirationHomologation = $derived.by(() => {
    if (!statistiques) return { x: [], y: [] };

    const donnees = statistiques.servicesParTrancheExpirationHomologation;
    return {
      x: Object.keys(donnees).map(
        (tranche) =>
          LIBELLES_TRANCHES_EXPIRATION[tranche as TrancheExpirationHomologation]
      ),
      y: Object.values(donnees),
    };
  });

  let nombreTotalServices = $derived(parDateCreation.y.at(-1) ?? 0);
  let nombreTotalEntites = $derived(parEntite.y.at(-1) ?? 0);

  let filtreNiveauxSecurite = $state<IdNiveauDeSecurite[]>([]);
  let filtreEntites = $state<string[]>([]);
  $effect(() => {
    rafraichisStatistiques();
  });
</script>

<h1>Statistiques</h1>
{#if statistiques}
  <div class="conteneur-filtres">
    <lab-anssi-multi-select
      label="Besoins de sécurité"
      options={[
        {
          id: 'niveau1',
          value: 'niveau1',
          label: 'Basiques',
        },
        {
          id: 'niveau2',
          value: 'niveau2',
          label: 'Modérés',
        },
        {
          id: 'niveau3',
          value: 'niveau3',
          label: 'Avancés',
        },
      ]}
      placeholder="Séléctionner un/des besoins"
      values={filtreNiveauxSecurite}
      onvaluechanged={(e: CustomEvent<IdNiveauDeSecurite[]>) =>
        (filtreNiveauxSecurite = e.detail)}
    ></lab-anssi-multi-select>
    <lab-anssi-multi-select
      label="Entités"
      options={entites.map((entite) => ({
        id: entite.siret,
        value: entite.siret,
        label: entite.nom,
      }))}
      placeholder="Sélectionner une/des entités"
      values={filtreEntites}
      onvaluechanged={(e: CustomEvent<string[]>) => (filtreEntites = e.detail)}
    ></lab-anssi-multi-select>
  </div>
  <div class="grille-graphiques">
    <LineChart
      titre="Évolution du nombre d’entités"
      baniereAvecChiffre={{
        chiffre: nombreTotalEntites,
        description: singulierPluriel(
          'Entité utilisatrice',
          'Entités utilisatrices',
          nombreTotalEntites
        ),
        icone: 'city_hall',
      }}
      x={parEntite.x}
      y={parEntite.y}
      nom="Nombre d'entités"
      unite="entités"
    />
    <LineChart
      titre="Évolution du nombre de services"
      baniereAvecChiffre={{
        chiffre: nombreTotalServices,
        description: singulierPluriel(
          'Service référencé',
          'Services référencés',
          nombreTotalServices
        ),
        icone: 'internet',
      }}
      x={parDateCreation.x}
      y={parDateCreation.y}
      nom="Nombre de services"
      unite="services"
    />
    <div class="ligne-un-tiers-deux-tiers">
      <CarteChiffreCle
        chiffre={statistiques.indiceCyberMoyen.toFixed(1)}
        description="Moyenne Indice Cyber"
        icone="data_visualization"
      />
      <BarChart
        titre="Répartition des Indices Cybers"
        x={parTrancheIndiceCyber.x}
        y={[parTrancheIndiceCyber.y]}
        unite="services"
        name={['nombre de services']}
      />
    </div>

    <div class="ligne-trois-items">
      <CarteChiffreCle
        chiffre={statistiques.nombreServicesHomologues}
        description={singulierPluriel(
          'Service homologué',
          'Services homologués',
          statistiques.nombreServicesHomologues
        )}
        icone="success"
      />
      <LineChart
        titre="Évolution du nombre d'homologations"
        x={parDateHomologation.x}
        y={parDateHomologation.y}
        nom="Nombre d'homologations"
        unite="homologations"
      />
      <PieChart
        titre="Répartition des dates d’expiration des homologations "
        x={parTrancheDureeExpirationHomologation.x}
        y={parTrancheDureeExpirationHomologation.y}
        unite="services"
      />
    </div>

    <div class="ligne-trois-items">
      <CarteChiffreCle
        chiffre={statistiques.nombreServicesCompletudeSuperieur80}
        description="{singulierPluriel(
          'Service',
          'Services',
          statistiques.nombreServicesCompletudeSuperieur80
        )} dont les mesures de sécurités sont remplies à plus de 80%"
        icone="data_security"
      />
      <BarChart
        titre="Taux de complétion moyen des mesures"
        x={parTrancheCompletude.x}
        y={[parTrancheCompletude.y]}
        unite="services"
        name={['nombre de services']}
      />
      <BarChart
        titre="Répartition des mesures par catégorie et statut"
        x={mesuresParCategorieEtStatut.x}
        y={mesuresParCategorieEtStatut.y}
        name={mesuresParCategorieEtStatut.libelles}
        unite="mesures"
        empile
        horizontal
      />
    </div>

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
{/if}

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
    margin: 0 0 24px;
  }

  .conteneur-filtres {
    display: flex;
    gap: 16px;

    lab-anssi-multi-select {
      width: fit-content;
    }
  }

  .grille-graphiques {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px 0;
    box-sizing: border-box;
    max-width: 1200px;

    .ligne-un-tiers-deux-tiers {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
    }

    .ligne-trois-items {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 2fr 2fr;
      gap: 24px;
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
