<script lang="ts">
  import type { PrioriteMesure, ReferentielPriorite } from './types.d';
  import { createEventDispatcher } from 'svelte';

  type IdDom = string;

  export let id: IdDom;
  export let priorite: PrioriteMesure | undefined | '';
  export let label = '';
  export let estLectureSeule = false;
  export let avecLibelleOption: boolean = false;
  export let priorites: ReferentielPriorite;

  const dispatch = createEventDispatcher<{
    input: { priorite: PrioriteMesure };
  }>();

  $: {
    if (!priorite) priorite = '';
  }
</script>

<label for={`priorite-${id}`} class:a-label={label !== ''}>
  {label}
  <select
    bind:value={priorite}
    id={`priorite-${id}`}
    class={priorite}
    class:avecLibelleOption
    class:vide={!priorite}
    disabled={estLectureSeule}
    on:input={(e) => {
      dispatch('input', { priorite: e.target?.value });
    }}
    on:click|stopPropagation
  >
    <option value="" disabled selected
      >{avecLibelleOption ? 'Définir la priorité' : '+'}</option
    >
    {#each Object.entries(priorites) as [valeur, labels]}
      <option value={valeur}>{labels.libelleComplet}</option>
    {/each}
  </select>
</label>

<style>
  label {
    margin: 0;
    font-weight: 500;
    line-height: 22px;
    color: var(--texte-clair);
  }

  label:has(> select:disabled) {
    color: var(--liseres-fonce);
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
    --couleur-fond: transparent;
    --couleur-texte: transparent;
    border: none;
    background: var(--couleur-fond-normal);
    color: var(--couleur-texte-normal);
    --couleur-texte-normal: var(--couleur-fond-survol);
    --couleur-fond-normal: var(--couleur-texte-survol);
    padding: 2px 6px 4px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    width: 27px;
    text-align: center;
  }

  select:not(:disabled) {
    cursor: pointer;
  }

  select:disabled.avecLibelleOption.vide {
    color: var(--liseres-fonce);
  }

  select:disabled {
    color: var(--liseres-fonce) !important;
    background: var(--fond-gris-pale) !important;
  }

  select.avecLibelleOption {
    width: fit-content;
    appearance: auto;
    text-align: left;
  }

  select:not(:disabled):hover {
    color: var(--couleur-texte-survol);
    background: var(--couleur-fond-survol);
  }

  select option {
    color: var(--texte-fonce);
  }

  select.p1 {
    --couleur-texte-survol: #ffe9e6;
    --couleur-fond-survol: #ff6584;
  }

  select.p2 {
    --couleur-texte-survol: #fff2de;
    --couleur-fond-survol: #faa72c;
  }

  select.p3 {
    --couleur-texte-survol: #d4f4db;
    --couleur-fond-survol: #0c8626;
  }

  select.vide {
    --couleur-texte-normal: var(--texte-clair);
    --couleur-fond-normal: var(--fond-gris-pale);
    --couleur-texte-survol: white;
    --couleur-fond-survol: var(--texte-clair);

    font-size: 18px;
    line-height: 20px;
    padding-top: 0;
  }

  select.avecLibelleOption.vide {
    --couleur-texte-normal: var(--texte-clair);
    --couleur-fond-normal: white;
    --couleur-texte-survol: var(--texte-clair);
    --couleur-fond-survol: white;

    border: 1px solid var(--liseres-fonce);
    font-size: 12px;
    line-height: 20px;
  }

  select.avecLibelleOption {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid transparent;
  }

  option {
    background: white;
    font-size: 14px;
  }
</style>
