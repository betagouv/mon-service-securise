<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { createEventDispatcher } from 'svelte';

  interface Props {
    id?: string;
    classe?: string;
    formulaireDuTiroir?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    id = '',
    classe = '',
    formulaireDuTiroir = false,
    children,
  }: Props = $props();

  let formulaire: HTMLFormElement = $state();

  const trouveLibellePour = (element: Element) => {
    for (const libelle of document.getElementsByTagName('label')) {
      if (libelle.htmlFor === element.id) return libelle;
    }
  };

  export const estValide = () => {
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

  const dispatch = createEventDispatcher<{
    formulaireValide: null;
    formulaireInvalide: null;
  }>();

  const verifieValidite = () => {
    dispatch(
      formulaire.checkValidity() ? 'formulaireValide' : 'formulaireInvalide'
    );
  };
</script>

<form
  bind:this={formulaire}
  onsubmit={preventDefault(verifieValidite)}
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
