<script lang="ts">
  import type { ReferentielStatut } from './types.d';
  import { validationChamp } from '../directives/validationChamp';
  import { createEventDispatcher } from 'svelte';

  export let id: string;
  export let statut: string | undefined;
  export let referentielStatuts: ReferentielStatut;

  export let label = '';
  export let estLectureSeule = false;
  export let requis = false;

  const dispatch = createEventDispatcher<{ input: { statut: string } }>();
</script>

<label for={`statut-${id}`} class:requis>
  {label}
  <select
    bind:value={statut}
    id={`statut-${id}`}
    class={statut}
    class:vide={!statut}
    disabled={estLectureSeule}
    required={requis}
    use:validationChamp={requis
      ? 'Ce champ est obligatoire. Veuillez sélectionner une option.'
      : ''}
    on:input={(e) => {
      dispatch('input', { statut: e.target?.value });
    }}
    on:click|stopPropagation
  >
    <option value="" disabled selected>-</option>
    {#each Object.entries(referentielStatuts) as [valeur, label]}
      <option value={valeur}>{label}</option>
    {/each}
  </select>
</label>

<style>
  label {
    margin-bottom: 16px;
  }

  select {
    appearance: auto;
    margin-top: 8px;
    --couleur: transparent;
    border: 1px solid var(--couleur);
    background: var(--couleur);
  }

  select.fait {
    --couleur: #d4f4db;
  }

  select.enCours {
    --couleur: #dbeeff;
  }

  select.nonFait {
    --couleur: #fff2de;
  }

  select.aLancer {
    --couleur: #e9ddff;
  }

  select.vide {
    --couleur: #f1f5f9;
  }

  option {
    background: white;
  }

  label.requis:before {
    content: '*';
    color: var(--rose-anssi);
    transform: translate(6px, -3px);
    margin-left: -10px;
    margin-right: 4px;
  }
</style>
