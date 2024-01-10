<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type {
    MesureGenerale,
    MesureSpecifique,
  } from '../tableauDesMesures.d';
  import CartoucheReferentiel from '../../ui/CartoucheReferentiel.svelte';
  import { Referentiel, type ReferentielStatut } from '../../ui/types.d';
  import SelectionStatut from '../../ui/SelectionStatut.svelte';
  import CartoucheIndispensable from '../../ui/CartoucheIndispensable.svelte';
  import { rechercheTextuelle } from '../tableauDesMesures.store';

  type IdDom = string;

  export let id: IdDom;
  export let referentiel: Referentiel;
  export let indispensable = false;
  export let mesure: MesureSpecifique | MesureGenerale;
  export let nom: string;
  export let categorie: string;
  export let referentielStatuts: ReferentielStatut;
  export let estLectureSeule: boolean;

  const dispatch = createEventDispatcher<{ modificationStatut: null }>();

  $: texteSurligne = nom.replace(
    new RegExp($rechercheTextuelle, 'ig'),
    (texte: string) => `<mark>${texte}</mark>`
  );
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="ligne-de-mesure" on:click>
  <CartoucheReferentiel {referentiel} />
  <div class="titre-mesure">
    <p class="titre">
      {@html texteSurligne}
    </p>
    <div class="conteneur-cartouches">
      <span class="categorie">{categorie}</span>
      {#if referentiel === Referentiel.ANSSI}
        <CartoucheIndispensable {indispensable} />
      {/if}
    </div>
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
    padding: 20px 56px 20px 16px;
    gap: 56px;
    margin-bottom: 8px;
    display: grid;
    grid-template-columns: 2fr 6fr 3fr;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    position: relative;
  }

  .ligne-de-mesure:after {
    content: '';
    width: 24px;
    height: 24px;
    display: flex;
    background: url('/statique/assets/images/forme_chevron_bleu.svg') no-repeat;
    background-size: contain;
    position: absolute;
    right: 16px;
    top: calc(50% - 12px);
  }

  :global(.ligne-de-mesure label) {
    margin-bottom: 0 !important;
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
    word-break: break-word;
  }

  .categorie {
    background: #f1f5f9;
    color: #667892;
    padding: 1px 8px 3px 8px;
    font-size: 0.9em;
    font-weight: 500;
    border-radius: 20px;
  }

  .conteneur-cartouches {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  :global(mark) {
    background: #d4f4db;
  }
</style>
