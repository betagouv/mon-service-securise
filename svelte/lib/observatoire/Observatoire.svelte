<script lang="ts">
  import '@gouvfr/dsfr-chart';
  import '@gouvfr/dsfr-chart/css';
  import LineChart from '../adminStatistiques/charts/LineChart.svelte';
  import type { ObservatoireProps } from './observatoire.d';
  import CarteChiffreCle from '../adminStatistiques/CarteChiffreCle.svelte';

  let {
    totalServices,
    cumulMensuelServices,
    mesuresFaitesParMois,
  }: ObservatoireProps = $props();

  const formatMois = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: '2-digit',
  });
  const enLibelleMois = (mois: string) =>
    formatMois.format(new Date(`${mois}-01T00:00:00`));

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
</script>

<h1>Observatoire</h1>

<div class="ligne">
  <CarteChiffreCle
    chiffre={totalServices}
    description="Systèmes d’information sécurisés"
    icone="data_visualization"
  />

  <LineChart
    titre="Évolution par mois (cumul)"
    x={moisServices}
    y={cumulsServices}
    nom="SI sécurisés"
    unite="SI"
  />
</div>

<div class="ligne">
  <CarteChiffreCle
    chiffre={totalMesuresFaitesADate.toLocaleString('fr-FR')}
    description="Faiblesses corrigées"
    icone="success"
  />

  <LineChart
    titre="Évolution par mois (cumul)"
    x={moisMesuresFaites}
    y={totauxMesuresFaites}
    nom="Mesures faites"
    unite="mesures"
  />
</div>

<style lang="scss">
  .ligne {
    display: flex;
    gap: 12px;
  }
</style>
