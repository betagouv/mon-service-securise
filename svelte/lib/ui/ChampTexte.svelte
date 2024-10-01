<script lang="ts">
  import { validationChamp } from '../directives/validationChamp';
  export let nom: string;
  export let id: string;
  export let valeur: string = '';
  export let requis: boolean = false;
  export let aideSaisie: string = '';
  export let messageErreur: string = '';
  export let modele: string | undefined = undefined;
</script>

<input
  type="text"
  {id}
  name={nom}
  bind:value={valeur}
  required={requis}
  placeholder={aideSaisie}
  use:validationChamp={requis || modele ? messageErreur : ''}
  pattern={modele}
  on:input
  on:focus
/>

<style>
  input {
    border-radius: 5px;
    border: 1px solid var(--liseres-fonce);
    font-size: 16px;
    padding: 8px 16px;
    line-height: 24px;
  }

  input:hover {
    border-color: var(--bleu-mise-en-avant);
  }
</style>
