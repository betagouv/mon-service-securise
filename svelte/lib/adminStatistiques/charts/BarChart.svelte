<script lang="ts">
  import Chart from './Chart.svelte';

  interface Props {
    titre: string;
    x: Array<string>;
    y: Array<Array<number>>;
    unite: string;
    name?: Array<string>;
    palette?: 'categorical';
    empile?: boolean;
    horizontal?: boolean;
  }

  let {
    titre,
    x,
    y,
    unite,
    name = undefined,
    palette = 'categorical',
    empile = false,
    horizontal = false,
  }: Props = $props();
</script>

<Chart {titre}>
  <bar-chart
    x={JSON.stringify([x])}
    y={JSON.stringify(y)}
    name={JSON.stringify(name || x)}
    unit-tooltip={unite}
    selected-palette={palette}
    stacked={empile}
    {horizontal}
  ></bar-chart>
</Chart>
