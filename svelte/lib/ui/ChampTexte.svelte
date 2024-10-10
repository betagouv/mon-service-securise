<script lang="ts">
  import { validationChamp } from '../directives/validationChamp';

  export let nom: string;
  export let id: string;
  export let valeur: string = '';
  export let requis: boolean = false;
  export let aideSaisie: string = '';
  export let messageErreur: string = '';
  export let modele: string | undefined = undefined;
  export let type: string = 'text';
  export let autocomplete: string = '';

  const typeChamp = (node: HTMLInputElement) => {
    node.type = type;
  };
</script>

<input
  use:typeChamp
  {id}
  name={nom}
  bind:value={valeur}
  required={requis}
  placeholder={aideSaisie}
  use:validationChamp={requis || modele ? messageErreur : ''}
  pattern={modele}
  on:input
  on:focus
  {autocomplete}
/>

<style>
  input {
    border-radius: 5px;
    border: 1px solid var(--liseres-fonce);
    font-size: 1rem;
    padding: 8px 16px;
    line-height: 1.5rem;
    background: white;
    margin-bottom: 0 !important;
  }

  input::placeholder {
    color: var(--texte-clair);
    opacity: 1;
  }

  input::-ms-input-placeholder {
    /* Edge 12 -18 */
    color: var(--texte-clair);
  }

  input:hover {
    border-color: var(--bleu-mise-en-avant);
  }
</style>
