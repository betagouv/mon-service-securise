<script lang="ts">
  import type { Risque, NiveauGravite } from './risques.d';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import { Referentiel } from '../ui/types.d';

  export let idService: string;
  export let estLectureSeule: boolean;
  export let risques: Risque[];
  export let categories: Record<string, string>;
  export let niveauxGravite: Record<string, NiveauGravite>;

  const metAJourRisque = async (risque: Risque) => {
    if (risque.type === 'GENERAL')
      await axios.put(`/api/service/${idService}/risques/${risque.id}`, {
        niveauGravite: risque.niveauGravite,
        commentaire: risque.commentaire,
      });
    else
      await axios.put(
        `/api/service/${idService}/risquesSpecifiques/${risque.id}`,
        {
          niveauGravite: risque.niveauGravite,
          commentaire: risque.commentaire,
          intitule: risque.intitule,
          categories: risque.categories,
        }
      );
  };
</script>

<h3>Risques</h3>
<table>
  <thead>
    <tr>
      <th>Identifiant</th>
      <th>Intitulé du risque</th>
      <th>Gravité potentielle</th>
    </tr>
  </thead>
  <tbody>
    {#each risques as risque (risque.id)}
      {@const estSpecifiqueAMettreAJour =
        risque.type === 'SPECIFIQUE' && !risque.categories.length}
      <tr class:estSpecifiqueAMettreAJour>
        <td class="identifiant-numerique">{risque.identifiantNumerique}</td>
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
            on:change={() => metAJourRisque(risque)}
          >
            <option label="+" value="" disabled />
            {#each Object.entries(niveauxGravite) as [id, niveauGravite] (id)}
              <option label={niveauGravite.position.toString()} value={id} />
            {/each}
          </select>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  h3 {
    text-align: left;
  }

  table {
    border-collapse: collapse;
    border: 1px solid #cbd5e1;
    text-align: left;
  }

  th {
    color: var(--texte-clair);
    font-size: 13px;
    font-weight: 500;
  }

  thead th {
    padding: 14px 24px;
    white-space: nowrap;
  }

  thead tr th:first-of-type,
  tbody tr td:first-of-type {
    padding-left: 24px;
  }

  thead tr th:last-of-type,
  tbody tr td:last-of-type {
    padding-right: 24px;
  }

  tbody td {
    padding: 24px 24px;
  }

  tr {
    border: 1px solid #cbd5e1;
  }

  .identifiant-numerique {
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
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
