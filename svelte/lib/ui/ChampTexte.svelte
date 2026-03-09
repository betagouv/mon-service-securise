<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import { validationChamp } from '../directives/validationChamp';

  interface Props {
    nom: string;
    id: string;
    valeur?: string;
    requis?: boolean;
    aideSaisie?: string;
    messageErreur?: string;
    modele?: string | undefined;
    type?: string;
    autocomplete?: string;
  }

  let {
    nom,
    id,
    valeur = $bindable(''),
    requis = false,
    aideSaisie = '',
    messageErreur = '',
    modele = undefined,
    type = 'text',
    autocomplete = '',
  }: Props = $props();

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
  oninput={bubble('input')}
  onfocus={bubble('focus')}
  onblur={bubble('blur')}
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
