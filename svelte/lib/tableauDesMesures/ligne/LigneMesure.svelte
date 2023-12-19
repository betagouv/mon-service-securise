<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type {
    MesureGenerale,
    MesureSpecifique,
  } from '../tableauDesMesures.d';

  type IdDom = string;

  export let id: IdDom;
  export let referentiel: {
    label: string;
    classe: string;
    indispensable?: boolean;
  };
  export let mesure: MesureSpecifique | MesureGenerale;
  export let nom: string;
  export let categorie: string;
  export let referentielStatuts: Record<string, string>;

  const dispatch = createEventDispatcher<{
    modificationStatut: null;
    click: null;
  }>();
</script>

<div class="ligne-de-mesure">
  <span
    class={`referentiel ${referentiel.classe}`}
    class:indispensable={referentiel.indispensable}>{referentiel.label}</span
  >
  <div class="titre-mesure">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <p class="titre" on:click={() => dispatch('click')}>
      {nom}
      <!-- svelte-ignore a11y-missing-attribute -->
      <img src="/statique/assets/images/chevron_noir.svg" />
    </p>
    <span class="categorie">{categorie}</span>
  </div>
  <label for={`statut-${id}`}>
    <select
      bind:value={mesure.statut}
      id={`statut-${id}`}
      class="intouche"
      required
      on:change={() => dispatch('modificationStatut')}
    >
      <option value="" disabled selected>--</option>
      {#each Object.entries(referentielStatuts) as [valeur, label]}
        <option value={valeur}>{label}</option>
      {/each}
    </select>
  </label>
</div>

<style>
  .ligne-de-mesure {
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 20px 16px;
    gap: 56px;
    margin-bottom: 8px;
    display: grid;
    grid-template-columns: 2fr 6fr 3fr;
    align-items: center;
    justify-content: space-between;
  }

  .referentiel {
    border-radius: 40px;
    padding: 4px 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
  }

  .referentiel.specifique {
    color: #08416a;
    background: #f1f5f9;
  }

  .referentiel.mss:not(.indispensable) {
    color: #0079d0;
    background: #dbeeff;
  }
  .referentiel.mss.indispensable {
    color: #7025da;
    background: #e9ddff;
  }

  .referentiel.mss:before {
    content: '';
    display: flex;
    background-image: url('/statique/assets/images/logo_mss_petit.svg');
    background-repeat: no-repeat;
    background-size: contain;
    width: 19px;
    height: 16px;
    margin-right: 6px;
  }

  .titre-mesure {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .titre-mesure p {
    margin: 0;
  }

  .titre {
    font-weight: 500;
    text-align: left;
    cursor: pointer;
  }

  .titre img {
    width: 24px;
    height: 24px;
    position: absolute;
  }

  .categorie {
    color: #667892;
    font-size: 0.9em;
    font-weight: 500;
  }

  select {
    appearance: auto;
  }
</style>
