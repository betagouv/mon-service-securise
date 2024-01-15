<script lang="ts">
  export let elements: HTMLElement[];
  export let doitEtreOuvert: boolean;

  const gereClic = (e: MouseEvent) => {
    const clicInterieur =
      elements.includes(e.target as HTMLElement) ||
      elements.some((el) => el.contains(e.target as Node));
    if (!clicInterieur) doitEtreOuvert = false;
  };
</script>

<svelte:body on:click={gereClic} />
