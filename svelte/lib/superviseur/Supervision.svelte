<script lang="ts">
  import { onMount } from 'svelte';
  import ChargementEnCours from '../ui/ChargementEnCours.svelte';
  import FilAriane from '../ui/FilAriane.svelte';

  let urlSupervision: string;
  let enCoursChargement: boolean = false;

  onMount(async () => {
    await recupereUrlIframe();
  });

  const recupereUrlIframe = async () => {
    enCoursChargement = true;
    const resultat = await axios.get(`/api/supervision`);
    urlSupervision = resultat.data.urlSupervision;
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
