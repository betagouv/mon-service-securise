<script lang="ts">
  export let element: HTMLElement;
  export let doitEtreOuvert: boolean;

  const gereClic = (e: MouseEvent) => {
    const clicInterieur =
      e.target === element || element?.contains(e.target as Node);
    if (!clicInterieur) doitEtreOuvert = false;
  };
</script>

<svelte:body on:click={gereClic} />
