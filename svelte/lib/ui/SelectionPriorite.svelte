<script lang="ts">
  import type { PrioriteMesure } from './types.d';
  import { createEventDispatcher } from 'svelte';

  type IdDom = string;

  export let id: IdDom;
  export let priorite: PrioriteMesure | undefined | '';
  export let label = '';
  export let estLectureSeule = false;

  const dispatch = createEventDispatcher<{
    input: { priorite: PrioriteMesure };
  }>();

  const referentielPriorites: Record<PrioriteMesure, string> = {
    p1: 'P1',
    p2: 'P2',
    p3: 'P3',
  };

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
    class:vide={!priorite}
    disabled={estLectureSeule}
    on:input={(e) => {
      dispatch('input', { priorite: e.target?.value });
    }}
    on:click|stopPropagation
  >
    <option value="" disabled selected>-</option>
    {#each Object.entries(referentielPriorites) as [valeur, label]}
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
    --couleur-fond: transparent;
    --couleur-texte: transparent;
    border: none;
    background: var(--couleur-texte);
    color: white;
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    width: 32px;
    cursor: pointer;
    text-align: center;
  }

  select:hover {
    color: var(--couleur-texte);
    background: var(--couleur-fond);
  }

  select option {
    color: var(--texte-fonce);
  }

  select.p1 {
    --couleur-fond: #ffe9e6;
    --couleur-texte: #ff6584;
  }

  select.p2 {
    --couleur-fond: #fff2de;
    --couleur-texte: #faa72c;
  }

  select.p3 {
    --couleur-fond: #d4f4db;
    --couleur-texte: #0c8626;
  }

  select.vide {
    --couleur-fond: #f1f5f9;
    --couleur-texte: #667892;
  }

  option {
    background: white;
  }
</style>
