<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type {
    MesureGenerale,
    MesureSpecifique,
  } from '../tableauDesMesures.d';
  import CartoucheReferentiel from '../../ui/CartoucheReferentiel.svelte';
  import type { Referentiel, ReferentielStatut } from '../../ui/types.d';
  import SelectionStatut from '../../ui/SelectionStatut.svelte';

  type IdDom = string;

  export let id: IdDom;
  export let referentiel: Referentiel;
  export let indispensable = false;
  export let mesure: MesureSpecifique | MesureGenerale;
  export let nom: string;
  export let categorie: string;
  export let referentielStatuts: ReferentielStatut;
  export let estLectureSeule: boolean;

  const dispatch = createEventDispatcher<{
    modificationStatut: null;
    click: null;
  }>();
</script>

<div class="ligne-de-mesure">
  <CartoucheReferentiel {referentiel} {indispensable} />
  <div class="titre-mesure">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <p class="titre" on:click={() => dispatch('click')}>
      {nom}
      <!-- svelte-ignore a11y-missing-attribute -->
      <img src="/statique/assets/images/chevron_noir.svg" />
    </p>
    <span class="categorie">{categorie}</span>
  </div>
  <SelectionStatut
    bind:statut={mesure.statut}
    {id}
    {estLectureSeule}
    {referentielStatuts}
    on:change={() => dispatch('modificationStatut')}
  />
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
    background: #f1f5f9;
    color: #667892;
    padding: 1px 8px 3px 8px;
    font-size: 0.9em;
    font-weight: 500;
    border-radius: 20px;
  }
</style>
