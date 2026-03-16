<script lang="ts">
  import { validationChamp } from '../directives/validationChamp';
  import type {
    FocusEventHandler,
    FormEventHandler,
    FullAutoFill,
  } from 'svelte/elements';

  interface Props {
    nom: string;
    id: string;
    valeur?: string;
    requis?: boolean;
    aideSaisie?: string;
    messageErreur?: string;
    modele?: string | undefined;
    type?: string;
    autocomplete?: FullAutoFill;
    oninput?: FormEventHandler<HTMLInputElement>;
    onfocus?: FocusEventHandler<HTMLInputElement>;
    onblur?: FocusEventHandler<HTMLInputElement>;
  }

  let {
    nom,
    id,
    valeur = $bindable(),
    requis = false,
    aideSaisie = '',
    messageErreur = '',
    modele = undefined,
    type = 'text',
    autocomplete = '',
    oninput,
    onfocus,
    onblur,
  }: Props = $props();

  $effect(() => {
    if (valeur === undefined) valeur = '';
  });

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
  {oninput}
  {onfocus}
  {onblur}
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
