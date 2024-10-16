<script lang="ts">
  import { validationChamp } from '../directives/validationChamp';

  export let valeur: string = '';
  export let aideSaisie: string = '';
  export let requis: boolean = false;
  export let messageErreur: string = '';
</script>

<textarea
  bind:value={valeur}
  required={requis}
  placeholder={aideSaisie}
  use:validationChamp={requis ? messageErreur : ''}
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
  }

  textarea:hover {
    border-color: var(--bleu-mise-en-avant);
  }
</style>
