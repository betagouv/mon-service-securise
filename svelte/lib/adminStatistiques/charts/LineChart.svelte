<script lang="ts">
  import Chart, { type ChartProps } from './Chart.svelte';

  interface Props extends ChartProps {
    x: Array<string>;
    y: Array<number>;
    nom: string;
    unite: string;
    palette?: 'categorical';
  }

  let {
    titre,
    baniereAvecChiffre,
    x,
    y,
    unite,
    nom,
    palette = 'categorical',
  }: Props = $props();
</script>

<Chart {titre} {baniereAvecChiffre}>
  <line-chart
    x={JSON.stringify([x])}
    y={JSON.stringify([y])}
    name={JSON.stringify([nom])}
    unit-tooltip={unite}
    selected-palette={palette}
  ></line-chart>
</Chart>
