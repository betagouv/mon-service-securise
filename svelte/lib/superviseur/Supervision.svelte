<script lang="ts">
  import { onMount } from 'svelte';
  import ChargementEnCours from '../ui/ChargementEnCours.svelte';
  import FilAriane from '../ui/FilAriane.svelte';
  import ListeDeroulante from '../ui/ListeDeroulante.svelte';

  export let optionsFiltrageDate: Record<string, string>;
  let urlSupervision: string;
  let enCoursChargement: boolean = false;

  let filtreDate: string;

  onMount(async () => {
    await recupereUrlIframe();
  });

  const recupereUrlIframe = async (parametres?: string) => {
    enCoursChargement = true;
    const resultat = await axios.get(
      `/api/supervision${parametres ? `?${parametres}` : ''}`
    );
    urlSupervision = resultat.data.urlSupervision;
  };

  const metAJourFiltres = async () => {
    const parametres = new URLSearchParams({
      ...(filtreDate && { filtreDate }),
    });
    await recupereUrlIframe(parametres.toString());
  };
</script>

<div class="conteneur-fil-ariane">
  <FilAriane
    items={[
      { label: 'Tableau de bord', lien: '/tableauDeBord' },
      { label: 'Statistiques' },
    ]}
  />
</div>
<h1>Statistiques</h1>
<div class="conteneur-filtres">
  <ListeDeroulante
    bind:valeur={filtreDate}
    on:change={metAJourFiltres}
    label="Date"
    id="filtre-date"
    options={[
      { label: 'Aucune date', valeur: '' },
      ...Object.entries(optionsFiltrageDate).map(([valeur, libelle]) => ({
        label: libelle,
        valeur,
      })),
    ]}
    aideSaisie="Sélectionner une date"
  />
</div>
{#if enCoursChargement}
  <div class="conteneur-loader">
    <ChargementEnCours />
  </div>
{/if}

{#if urlSupervision}
  <iframe
    title="Dashboard supervision"
    src={urlSupervision}
    width="800"
    height="1000"
    allowtransparency
    on:load={() => (enCoursChargement = false)}
  />
{/if}

<style>
  :global(#conteneur-supervision) {
    width: 100%;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  iframe {
    width: 100%;
    border: none;
  }

  .conteneur-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    margin-top: 128px;
    position: absolute;
    left: 50%;
  }

  .conteneur-fil-ariane {
    padding: 48px 0 32px 0;
  }

  h1 {
    margin: 0 0 24px;
  }
</style>
