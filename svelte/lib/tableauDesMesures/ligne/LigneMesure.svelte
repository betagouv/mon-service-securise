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
  import CartoucheIdentifiantMesure from '../../ui/CartoucheIdentifiantMesure.svelte';
  import { rechercheTextuelle } from '../stores/rechercheTextuelle.store';
  import SelectionPriorite from '../../ui/SelectionPriorite.svelte';

  type IdDom = string;

  export let id: IdDom;
  export let referentiel: Referentiel;
  export let indispensable = false;
  export let mesure: MesureSpecifique | MesureGenerale;
  export let nom: string;
  export let categorie: string;
  export let referentielStatuts: ReferentielStatut;
  export let estLectureSeule: boolean;
  export let affichePlanAction: boolean;

  const dispatch = createEventDispatcher<{
    modificationStatut: { statut: string };
  }>();

  $: texteSurligne = nom.replace(
    new RegExp($rechercheTextuelle, 'ig'),
    (texte: string) => ($rechercheTextuelle ? `<mark>${texte}</mark>` : texte)
  );
</script>

<tr class="ligne-de-mesure" on:click>
  <td class="titre-mesure">
    <p class="titre">
      {@html texteSurligne}
    </p>
    <div class="conteneur-cartouches">
      <CartoucheReferentiel {referentiel} />
      <span class="categorie">{categorie}</span>
      {#if referentiel !== Referentiel.SPECIFIQUE}
        <CartoucheIndispensable {indispensable} />
      {/if}
      <CartoucheIdentifiantMesure identifiant={mesure.identifiantNumerique} />
    </div>
  </td>
  {#if affichePlanAction}
    <td>
      <SelectionPriorite
        bind:priorite={mesure.priorite}
        {id}
        {estLectureSeule}
      />
    </td>{/if}
  <td>
    <SelectionStatut
      bind:statut={mesure.statut}
      {id}
      {estLectureSeule}
      {referentielStatuts}
      on:input={(e) =>
        dispatch('modificationStatut', { statut: e.detail.statut })}
    />
  </td>
</tr>

<style>
  .ligne-de-mesure {
    cursor: pointer;
    position: relative;
    border: 1px solid var(--liseres-fonce);
  }

  .ligne-de-mesure:hover {
    box-shadow: 0 12px 16px 0 rgba(0, 121, 208, 0.12);
  }

  .ligne-de-mesure td {
    padding: 24px 32px;
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
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .conteneur-cartouches {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  :global(mark) {
    background: #d4f4db;
  }
</style>
