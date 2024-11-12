<script lang="ts">
  import { onMount } from 'svelte';
  import ChargementEnCours from '../ui/ChargementEnCours.svelte';

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
    height="600"
    allowtransparency
    on:load={() => (enCoursChargement = false)}
  />
{/if}

<style>
  :global(#conteneur-supervision) {
    width: 100%;
    height: 100%;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .conteneur-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: white;
  }
</style>
