<script lang="ts">
  import ListeDeroulante from '../ui/ListeDeroulante.svelte';
  import { tick } from 'svelte';

  const optionsListeDeroulante = [
    { label: 'Option 1', valeur: 1 },
    { label: 'Option 2', valeur: 2 },
    { label: 'Option 3', valeur: 3 },
    { label: 'Option 4', valeur: 4 },
  ];
  let desactiveListeDeroulante = false,
    descriptionListeDeroulante = false,
    avecErreurListeDeroulante = false;

  const declencheValidation = async (id: string) => {
    (document.getElementById(id) as HTMLInputElement)?.reportValidity();
  };
</script>

<div class="conteneur">
  <h1>Système de Design de MonServiceSécurisé</h1>

  <h2>Liste déroulante - Select</h2>
  <p>
    La liste déroulante permet à un utilisateur de choisir un élément dans une
    liste donnée.
  </p>
  <p>
    Elle fournit une liste d’option parmi laquelle l’utilisateur peut choisir.
    Seule la partie visible du composant est stylisé : la liste d’option
    déroulée conserve le style du navigateur.
  </p>
  <div class="conteneur-composant">
    {#key avecErreurListeDeroulante}
      <ListeDeroulante
        id="liste-deroulante"
        label="Libellé"
        options={optionsListeDeroulante}
        desactive={desactiveListeDeroulante}
        texteDescriptionAdditionnel={descriptionListeDeroulante
          ? 'Texte de description additionnel'
          : ''}
        requis={avecErreurListeDeroulante}
        messageErreur={avecErreurListeDeroulante
          ? 'Texte d’erreur obligatoire'
          : ''}
        messageValide={avecErreurListeDeroulante
          ? 'Texte de validation optionnel'
          : ''}
      />
    {/key}
    <div class="options-composant">
      <h3>Options du composant</h3>
      <div>
        <input
          type="checkbox"
          id="liste-deroulante-desactive"
          bind:checked={desactiveListeDeroulante}
        />
        <label for="liste-deroulante-desactive">Désactivé</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="liste-deroulante-description"
          bind:checked={descriptionListeDeroulante}
        />
        <label for="liste-deroulante-description">Avec description</label>
      </div>

      <div>
        <input
          type="checkbox"
          id="liste-deroulante-erreur"
          bind:checked={avecErreurListeDeroulante}
          on:change={() => declencheValidation('liste-deroulante')}
        />
        <label for="liste-deroulante-erreur"
          >Avec message d'erreur / de validation</label
        >
      </div>
    </div>
  </div>
</div>

<style>
  :global(main) {
    text-align: left;
    background: white;
  }

  :global(#ui-kit) {
    max-width: 1200px;
    margin: 0 auto;
  }

  .conteneur {
    padding-bottom: 64px;
  }

  .conteneur-composant {
    padding: 32px 0;
    border-top: 1px solid #dddddd;
  }

  .options-composant {
    margin-top: 16px;
    padding: 8px 0;
  }
</style>
