<script lang="ts">
  import { validationChamp } from '../directives/validationChamp';

  interface Props {
    valeur?: string;
    aideSaisie?: string;
    requis?: boolean;
    messageErreur?: string;
    lignes?: number | undefined;
    max?: number | undefined;
  }

  let {
    valeur = $bindable(''),
    aideSaisie = '',
    requis = false,
    messageErreur = '',
    lignes = undefined,
    max = undefined,
  }: Props = $props();
</script>

<textarea
  bind:value={valeur}
  required={requis}
  placeholder={aideSaisie}
  use:validationChamp={requis ? messageErreur : ''}
  rows={lignes}
  class:sans-hauteur={!lignes}
  maxlength={max}
></textarea>

<style>
  textarea {
    margin: 0;
    border-radius: 5px;
    border: 1px solid var(--liseres-fonce);
    font-size: 1rem;
    padding: 8px 16px;
    line-height: 1.5rem;
    background: white;
    height: auto;
  }

  .sans-hauteur {
    height: 10rem;
  }

  textarea:hover {
    border-color: var(--bleu-mise-en-avant);
  }
</style>
