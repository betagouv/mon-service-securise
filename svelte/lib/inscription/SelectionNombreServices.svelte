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

<div class="conteneur">
  <select
    class:vide={!nombreServices}
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
</div>

<style>
  select {
    appearance: none !important;
    background: white;
    border: 1px solid var(--liseres-fonce);
    font-size: 1rem;
    padding: 8px 16px;
    line-height: 1.5rem;
    margin: 0;
  }

  .conteneur::after {
    content: '';
    display: inline-block;

    width: 0.4rem;
    height: 0.4rem;

    border: 2px #000 solid;
    border-left: 0;
    border-bottom: 0;

    transform: rotate(135deg);
    filter: brightness(0%);
    right: 16px;
    position: absolute;
    top: 14px;
  }

  .conteneur {
    position: relative;
  }

  .conteneur::after {
    content: '';
    display: inline-block;

    width: 0.4rem;
    height: 0.4rem;

    border: 2px #000 solid;
    border-left: 0;
    border-bottom: 0;

    transform: rotate(135deg);
    filter: brightness(0%);
    right: 16px;
    position: absolute;
    top: 14px;
  }

  .conteneur {
    position: relative;
  }

  select:hover {
    border-color: var(--bleu-mise-en-avant);
  }

  select.vide {
    color: var(--texte-clair);
  }

  option {
    font-size: 1rem;
  }
</style>
