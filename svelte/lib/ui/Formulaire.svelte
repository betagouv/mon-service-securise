<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    id?: string;
    classe?: string;
    formulaireDuTiroir?: boolean;
    children?: Snippet;
    onFormulaireValide?: () => void;
    onFormulaireInvalide?: () => void;
  }

  let {
    id = '',
    classe = '',
    formulaireDuTiroir = false,
    children,
    onFormulaireValide,
    onFormulaireInvalide,
  }: Props = $props();

  let formulaire: HTMLFormElement | undefined = $state();

  const trouveLibellePour = (element: Element) => {
    for (const libelle of document.getElementsByTagName('label')) {
      if (libelle.htmlFor === element.id) return libelle;
    }
  };

  export const estValide = () => {
    if (!formulaire) return;

    const valide = formulaire.checkValidity();
    const champAvecErreur = formulaire.querySelectorAll(
      'input:invalid, select:invalid'
    );
    if (champAvecErreur.length) {
      let element = champAvecErreur[0];
      const libelle = trouveLibellePour(element);
      if (libelle) element = libelle;
      element.scrollIntoView({ behavior: 'smooth' });
    }
    return valide;
  };

  const verifieValidite = () => {
    if (!formulaire) return;
    if (formulaire.checkValidity()) {
      onFormulaireValide?.();
    } else {
      onFormulaireInvalide?.();
    }
  };
</script>

<form
  bind:this={formulaire}
  onsubmit={(e) => {
    e.preventDefault();
    verifieValidite();
  }}
  {id}
  novalidate
  class={classe}
  class:formulaireDuTiroir
>
  {@render children?.()}
</form>

<style>
  .formulaireDuTiroir {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
