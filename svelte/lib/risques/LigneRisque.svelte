<script lang="ts">
  import type { NiveauGravite, Risque } from './risques.d';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import { Referentiel } from '../ui/types.d';
  import { createEventDispatcher } from 'svelte';

  export let categories: Record<string, string>;
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

<tr class:estSpecifiqueAMettreAJour on:click>
  <td>
    <span class="identifiant-numerique">{risque.identifiantNumerique}</span>
  </td>
  <td class="intitule">
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
    <select
      class="niveau-gravite {risque.niveauGravite}"
      class:vide={!risque.niveauGravite}
      bind:value={risque.niveauGravite}
      disabled={estLectureSeule || estSpecifiqueAMettreAJour}
      on:change={metAJourRisque}
    >
      <option label="+" value="" disabled />
      {#each Object.entries(niveauxGravite) as [id, niveauGravite] (id)}
        <option label={niveauGravite.position.toString()} value={id} />
      {/each}
    </select>
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

  .niveau-gravite {
    display: flex;
    width: 23px;
    padding: 0 4px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    font-weight: 700;
    line-height: 24px;
    box-sizing: border-box;
    margin: 0;
    text-align: center;
  }

  .niveau-gravite.nonConcerne {
    background: var(--liseres-fonce);
  }

  .niveau-gravite.minime {
    background: var(--bleu-mise-en-avant);
  }

  .niveau-gravite.significatif {
    background: var(--bleu-survol);
  }

  .niveau-gravite.grave {
    background: var(--bleu-anssi);
  }

  .niveau-gravite.critique {
    background: black;
  }

  .niveau-gravite.vide {
    background: var(--fond-gris-pale);
    color: var(--texte-clair);
  }

  .estSpecifiqueAMettreAJour {
    background: var(--fond-ocre-pale);
  }
</style>
