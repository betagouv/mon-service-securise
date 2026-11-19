<script lang="ts">
  import '@gouvfr/dsfr-chart';
  import '@gouvfr/dsfr-chart/css';
  import LineChart from '../adminStatistiques/charts/LineChart.svelte';
  import type { ObservatoireProps } from './observatoire.d';
  import CarteChiffreCle from '../adminStatistiques/CarteChiffreCle.svelte';

  let { totalServices, cumulMensuelServices }: ObservatoireProps = $props();

  let mois = $derived(cumulMensuelServices.map(({ mois }) => mois));
  let cumuls = $derived(cumulMensuelServices.map(({ cumul }) => cumul));
</script>

<h1>Observatoire</h1>

<div>
  <CarteChiffreCle
    chiffre={totalServices}
    description="Systèmes d’information sécurisés"
    icone="data_visualization"
  />

  <LineChart
    titre="Évolution par mois (cumul)"
    x={mois}
    y={cumuls}
    nom="SI sécurisés"
    unite="SI"
  />
</div>

<style lang="scss">
  div {
    display: flex;
    gap: 12px;
  }
</style>
