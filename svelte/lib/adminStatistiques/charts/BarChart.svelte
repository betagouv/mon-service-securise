<script lang="ts">
  import Chart from './Chart.svelte';

  interface Props {
    titre: string;
    x: Array<string>;
    y: Array<number>;
    unite: string;
    palette?: 'categorical';
  }

  let { titre, x, y, unite, palette = 'categorical' }: Props = $props();
</script>

<Chart {titre}>
  <bar-chart
    x={JSON.stringify([x])}
    y={JSON.stringify([y])}
    name={JSON.stringify(x)}
    unit-tooltip={unite}
    selected-palette={palette}
  ></bar-chart>
</Chart>
