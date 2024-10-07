<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id: string = '';
  export let classe: string = '';

  let formulaire: HTMLFormElement;

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
  on:submit|preventDefault={verifieValidite}
  {id}
  novalidate
  class={classe}
>
  <slot />
</form>
