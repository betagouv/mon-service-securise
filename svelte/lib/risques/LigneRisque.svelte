<script lang="ts">
  import type {
    ReferentielCategories,
    ReferentielGravites,
    ReferentielVraisemblances,
    Risque,
  } from './risques.d';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import { Referentiel } from '../ui/types.d';
  import { createEventDispatcher } from 'svelte';
  import SelectionGravite from './SelectionGravite.svelte';
  import { intituleRisque, niveauRisque, risqueAMettreAJour } from './risques';
  import SelectionVraisemblance from './SelectionVraisemblance.svelte';
  import IdentifiantRisque from './IdentifiantRisque.svelte';

  export let categories: ReferentielCategories;
  export let niveauxGravite: ReferentielGravites;
  export let niveauxVraisemblance: ReferentielVraisemblances;
  export let estLectureSeule: boolean;
  export let risque: Risque;

  $: estSpecifiqueAMettreAJour = risqueAMettreAJour(risque);

  const emet = createEventDispatcher<{
    metAJourRisque: null;
  }>();

  const metAJourRisque = () => {
    emet('metAJourRisque');
  };
</script>

<tr>
  <td>
    <IdentifiantRisque {risque} {niveauxVraisemblance} {niveauxGravite} />
  </td>
  <td class="intitule" on:click>
    <p
      class="intitule-risques"
      title={estSpecifiqueAMettreAJour ? 'Ce risque doit être mis à jour' : ''}
    >
      {intituleRisque(risque)}
    </p>
    <p class="cartouches-intitule">
      <CartoucheReferentiel
        referentiel={risque.type === 'GENERAL'
          ? Referentiel.ANSSI
          : Referentiel.RISQUE_SPECIFIQUE}
      />
      {#each risque.categories as categorie, index (index)}
        <span class="cartouche-categorie">{categories[categorie]}</span>
      {/each}
    </p>
    {#if estSpecifiqueAMettreAJour}
      <span class="a-mettre-a-jour">⚠️ Risque à mettre à jour</span>
    {/if}
  </td>
  <td>
    <SelectionGravite
      estLectureSeule={estLectureSeule || estSpecifiqueAMettreAJour}
      referentielGravites={niveauxGravite}
      bind:niveauGravite={risque.niveauGravite}
      on:change={metAJourRisque}
    />
  </td>
  <td>
    <SelectionVraisemblance
      estLectureSeule={estLectureSeule || estSpecifiqueAMettreAJour}
      referentielVraisemblances={niveauxVraisemblance}
      bind:niveauVraisemblance={risque.niveauVraisemblance}
      on:change={metAJourRisque}
    />
  </td>
</tr>

<style>
  tr td:first-of-type {
    padding-left: 24px;
  }

  tr td:last-of-type {
    padding-right: 24px;
  }

  td {
    padding: 24px 24px;
  }

  tr {
    border: 1px solid #cbd5e1;
  }

  tr:has(.intitule:hover) {
    box-shadow: 0 12px 16px 0 rgba(0, 121, 208, 0.12);
  }

  .intitule {
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
  }

  .intitule:hover .intitule-risques {
    color: var(--bleu-mise-en-avant);
  }

  .intitule-risques {
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
    margin: 0;
  }

  .cartouches-intitule {
    margin: 0;
    display: flex;
    gap: 8px;
  }

  .cartouche-categorie {
    display: flex;
    height: 24px;
    padding: 1px 8px 3px 8px;
    align-items: center;
    gap: 6px;
    border-radius: 40px;
    background: #f1f5f9;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
  }

  .a-mettre-a-jour {
    font-size: 12px;
    line-height: 20px;
  }
</style>
