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
  }
</style>
