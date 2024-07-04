<script lang="ts">
  type IdNiveauDeSecurite = string;
  type NiveauDeSecurite = {
    id: IdNiveauDeSecurite;
    nom: string;
    resume: string;
  };
  let niveauChoisi: IdNiveauDeSecurite;

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

<div>
  <div class="niveaux">
    {#each niveaux as niveau}
      <div class="boite-niveau">
        <h4>{niveau.nom}</h4>
        <p>{niveau.resume}</p>
        <input
          type="radio"
          id={niveau.id}
          bind:group={niveauChoisi}
          value={niveau.id}
        />
        <label for={niveau.id}> Sélectionner ce niveau </label>
      </div>
    {/each}
  </div>
</div>

<style>
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
    border: 1px dashed var(--liseres-fonce);
    border-radius: 5px;
  }

  .boite-niveau h4 {
    font-weight: 700;
    font-size: 1.56rem;
    margin: 0 0 12px 0;
  }

  label {
    padding: 7px 16px 9px 16px;
    color: var(--bleu-mise-en-avant);
    font-weight: 500;
    border: 1px solid var(--bleu-mise-en-avant);
    border-radius: 4px;
    width: fit-content;
    margin: auto auto 0;
  }
</style>
