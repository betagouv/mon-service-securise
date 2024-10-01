<script lang="ts">
  import { validationChamp } from '../directives/validationChamp';
  import type { EstimationNombreServices } from './inscription.d';

  export let id: string;
  export let nombreServices: string = '';
  export let estimationNombreServices: EstimationNombreServices[];
</script>

<select
  {id}
  required
  bind:value={nombreServices}
  use:validationChamp={'Ce champ est obligatoire. Veuillez sélectionner une option.'}
>
  <option value="" disabled selected>Sélectionner un nombre</option>
  {#each estimationNombreServices as estimation}
    {@const valeur = `${estimation.borneBasse}_${estimation.borneHaute}`}
    <option value={valeur}>{estimation.label}</option>
  {/each}
</select>

<style>
  select {
    appearance: auto;
    background: white;
    border: 1px solid var(--liseres-fonce);
    font-size: 14px;
  }

  select:hover {
    border-color: var(--bleu-mise-en-avant);
  }

  option {
    font-size: 14px;
  }
</style>
