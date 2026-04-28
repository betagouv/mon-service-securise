<script lang="ts">
  interface Props {
    elements: HTMLElement[];
    doitEtreOuvert: boolean;
  }

  // eslint-disable-next-line no-useless-assignment
  let { elements, doitEtreOuvert = $bindable() }: Props = $props();

  const gereClic = (e: MouseEvent) => {
    const clicInterieur =
      elements.includes(e.target as HTMLElement) ||
      elements.some((el) => el.contains(e.target as Node));
    if (!clicInterieur) doitEtreOuvert = false;
  };
</script>

<svelte:body onclick={gereClic} />
