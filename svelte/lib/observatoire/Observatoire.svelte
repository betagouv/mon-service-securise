<script lang="ts">
  import type { ObservatoireProps } from './observatoire.d';

  let { totalServices }: ObservatoireProps = $props();
</script>

<h1>Observatoire</h1>

<p>{totalServices}</p>
