<script lang="ts">
  import { validationChamp } from '../directives/validationChamp';

  export let valeur: string = '';
  export let aideSaisie: string = '';
  export let requis: boolean = false;
  export let messageErreur: string = '';
  export let lignes: number | undefined = undefined;
</script>

<textarea
  bind:value={valeur}
  required={requis}
  placeholder={aideSaisie}
  use:validationChamp={requis ? messageErreur : ''}
  rows={lignes}
  class:sans-hauteur={!lignes}
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
