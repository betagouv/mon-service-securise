<script lang="ts">
  type IdNiveauDeSecurite = 'niveau1' | 'niveau2' | 'niveau3';
  type NiveauDeSecurite = {
    id: IdNiveauDeSecurite;
    nom: string;
    resume: string;
  };
  let niveauChoisi: IdNiveauDeSecurite;
  let niveauSurbrillance: IdNiveauDeSecurite;

  const niveaux: NiveauDeSecurite[] = [
    {
      id: 'niveau1',
      nom: 'Élémentaires',
      resume:
        "Les besoins de sécurité sont élémentaires en l'absence de données ou de fonctionnalités sensibles.",
    },
    {
      id: 'niveau2',
      nom: 'Modérés',
      resume:
        'Les besoins de sécurité sont modérés compte tenu de données ou de fonctionnalités plus sensibles traitées par le service.',
    },
    {
      id: 'niveau3',
      nom: 'Importants',
      resume:
        'Les besoins de sécurité sont importants compte tenu de la sensibilité des données traitées ou des fonctionnalités proposées.',
    },
  ];
</script>

<div class="racine">
  <div class="niveaux">
    {#each niveaux as niveau}
      <button
        type="button"
        class="boite-niveau"
        class:niveau-choisi={niveau.id === niveauChoisi}
        class:boite-en-surbrillance={niveau.id === niveauSurbrillance}
        on:click={() => (niveauSurbrillance = niveau.id)}
      >
        <h4>{niveau.nom}</h4>
        <p>{niveau.resume}</p>
        <input
          type="radio"
          id={niveau.id}
          bind:group={niveauChoisi}
          value={niveau.id}
        />
        <label class:niveau-choisi={niveau.id === niveauChoisi} for={niveau.id}>
          {niveau.id === niveauChoisi
            ? 'Niveau sélectionné'
            : 'Sélectionner ce niveau'}
        </label>
      </button>
    {/each}
  </div>
  {#if niveauSurbrillance}
    <div
      class="details-niveau"
      class:details-niveau-choisi={niveauChoisi === niveauSurbrillance}
    >
      {#if niveauSurbrillance === 'niveau1'}
        <h4>Démarche adaptée au niveau élémentaire : initiale</h4>
      {/if}
      {#if niveauSurbrillance === 'niveau2'}
        <h4>Démarche adaptée au niveau modéré : intermédiaire</h4>
      {/if}
      {#if niveauSurbrillance === 'niveau3'}
        <h4>Démarche adaptée au niveau élevé : importante</h4>
      {/if}
    </div>
  {/if}
</div>

<style>
  .racine {
    padding-top: 48px;
  }

  .niveaux {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    column-gap: 24px;
  }

  input[type='radio'] {
    display: none;
  }

  .boite-niveau {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 32px 11px;
    cursor: pointer;
    border: 2px dashed var(--liseres-fonce);
    border-radius: 5px;
    background: transparent;
    margin-bottom: 24px;
  }

  .boite-niveau h4 {
    font-weight: 700;
    font-size: 1.56rem;
    margin: 0 auto 12px auto;
  }

  .boite-niveau.niveau-choisi,
  label.niveau-choisi,
  div.details-niveau-choisi {
    border-color: #0c8626;
    border-style: solid;
  }

  label.niveau-choisi {
    color: #0c8626;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  label.niveau-choisi::after {
    display: block;
    width: 20px;
    height: 20px;
    content: '';
    background: url(/statique/assets/images/icone_ok_cercle_vert.svg) no-repeat
      center;
    margin-left: 6px;
    background-position-y: -7px;
    background-size: cover;
  }

  .boite-en-surbrillance {
    border: 2px solid var(--bleu-mise-en-avant);
  }

  label {
    padding: 7px 16px 9px 16px;
    color: var(--bleu-mise-en-avant);
    font-weight: 500;
    border: 1px solid var(--bleu-mise-en-avant);
    border-radius: 4px;
    width: fit-content;
    margin: auto auto 0;
    cursor: pointer;
  }

  .details-niveau {
    border: 2px solid var(--bleu-mise-en-avant);
    border-radius: 8px;
  }
</style>
