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
  export let version: 'normale' | 'accentuee' = 'normale';

  const dispatch = createEventDispatcher<{ input: { statut: string } }>();

  $: {
    if (!statut) statut = '';
  }
</script>

<label for={`statut-${id}`} class:requis class:a-label={label !== ''}>
  {label}
  <select
    bind:value={statut}
    id={`statut-${id}`}
    class={`${statut} ${version}`}
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
    <option value="" disabled selected>Statut à définir</option>
    {#each Object.entries(referentielStatuts) as [valeur, label]}
      <option value={valeur}>{label}</option>
    {/each}
  </select>
</label>

<style>
  label {
    margin: 0;
  }

  label.a-label {
    margin-bottom: 16px;
  }

  label.a-label select {
    margin-top: 8px;
  }

  select {
    appearance: none;
    margin: 0;
    --couleur-claire: transparent;
    --couleur-foncee: transparent;
    --taille: 32px;
    border: none;
    background: var(--couleur-claire);
    color: var(--couleur-foncee);
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    width: var(--taille);
    cursor: pointer;
  }

  select.accentuee {
    color: white;
    background: var(--couleur-foncee);
  }

  select:not(:disabled):hover {
    color: var(--couleur-claire);
    background: var(--couleur-foncee);
  }

  select:not(:disabled).accentuee:hover {
    color: var(--couleur-foncee);
    background: var(--couleur-claire);
  }

  select option {
    color: var(--texte-fonce);
  }

  select.fait {
    --couleur-claire: #d4f4db;
    --couleur-foncee: #0c8626;
    --taille: 46px;
  }

  select.enCours {
    --couleur-claire: #dbeeff;
    --couleur-foncee: #0079d0;
    --taille: 75px;
  }

  select.nonFait {
    --couleur-claire: #fff2de;
    --couleur-foncee: #faa72c;
    --taille: 155px;
  }

  select.aLancer {
    --couleur-claire: #e9ddff;
    --couleur-foncee: #7025da;
    --taille: 75px;
  }

  select.vide {
    --couleur-claire: #f1f5f9;
    --couleur-foncee: #667892;
    --taille: 124px;
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
