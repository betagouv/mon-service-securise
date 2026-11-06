<script lang="ts">
  interface Props {
    elements: HTMLElement[];
    doitEtreOuvert: boolean;
  }

  // eslint-disable-next-line no-useless-assignment
  let { elements, doitEtreOuvert = $bindable() }: Props = $props();

  const gereClic = (e: MouseEvent) => {
    if (!elements || !Array.isArray(elements)) {
      return;
    }
    const cheminDuClic = e.composedPath();
    const clicInterieur = elements.some((el) => cheminDuClic.includes(el));
    if (!clicInterieur) doitEtreOuvert = false;
  };
</script>

<svelte:body onclick={gereClic} />
