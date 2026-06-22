<script lang="ts">
  interface Props {
    pourcentageCompletude: number;
  }

  let { pourcentageCompletude }: Props = $props();

  let valeurCompletude = $derived(pourcentageCompletude || 0);
</script>

<span>{Math.round(valeurCompletude * 100)}%</span>
