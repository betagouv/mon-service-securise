<script lang="ts">
  import { validationChamp } from '../directives/validationChamp';
  import type { EstimationNombreServices, Intervalle } from './inscription.d';

  export let id: string;
  export let estimationNombreServices: EstimationNombreServices[];
  export let valeur: Intervalle | null;

  let nombreServices: string = valeur
    ? `${valeur.borneBasse}_${valeur.borneHaute}`
    : '';
  $: {
    valeur = nombreServices
      ? {
          borneBasse: nombreServices.split('_')[0],
          borneHaute: nombreServices.split('_')[1],
        }
      : null;
  }
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
    font-size: 0.875rem;
  }

  select:hover {
    border-color: var(--bleu-mise-en-avant);
  }

  option {
    font-size: 0.875rem;
  }
</style>
