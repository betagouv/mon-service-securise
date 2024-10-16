<script lang="ts">
  import type {
    NiveauGravite,
    ReferentielCategories,
    Risque,
  } from './risques.d';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import { Referentiel } from '../ui/types.d';
  import { createEventDispatcher } from 'svelte';
  import SelectionGravite from './SelectionGravite.svelte';

  export let categories: ReferentielCategories;
  export let niveauxGravite: Record<string, NiveauGravite>;
  export let estLectureSeule: boolean;

  export let risque: Risque;

  $: estSpecifiqueAMettreAJour =
    risque.type === 'SPECIFIQUE' && !risque.categories.length;

  const emet = createEventDispatcher<{
    metAJourRisque: null;
  }>();

  const metAJourRisque = () => {
    emet('metAJourRisque');
  };
</script>

<tr class:estSpecifiqueAMettreAJour>
  <td>
    <span class="identifiant-numerique">{risque.identifiantNumerique}</span>
  </td>
  <td class="intitule" on:click>
    <p class="intitule-risques" title="Ce risque doit être mis à jour">
      {estSpecifiqueAMettreAJour ? '⚠️ ' : ''}{risque.intitule}
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
  </td>
  <td>
    <SelectionGravite
      estLectureSeule={estLectureSeule || estSpecifiqueAMettreAJour}
      referentielGravites={niveauxGravite}
      bind:niveauGravite={risque.niveauGravite}
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

  .identifiant-numerique {
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    display: flex;
    height: 24px;
    padding: 0 10px;
    align-items: center;
    gap: 4px;
    border-radius: 40px;
    border: 1.5px solid var(--texte-fonce);
    width: fit-content;
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

  .estSpecifiqueAMettreAJour {
    background: var(--fond-ocre-pale);
  }
</style>
