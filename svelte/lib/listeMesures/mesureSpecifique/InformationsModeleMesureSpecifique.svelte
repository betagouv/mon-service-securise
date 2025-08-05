<script lang="ts">
  import type { ListeMesuresProps } from '../listeMesures.d';
  import ChampDeSaisie from '../../ui/ChampDeSaisie.svelte';
  import ListeDeroulante from '../../ui/ListeDeroulante.svelte';

  type InformationModeleMesure = {
    description: string;
    descriptionLongue: string;
    categorie: string;
  };

  export let donneesModeleMesure: InformationModeleMesure;
  export let categories: ListeMesuresProps['categories'];
</script>

<h3>Modifier les informations de la mesure</h3>
<div class="contenu-formulaire">
  <div class="info-champ-obligatoire">Champ obligatoire</div>
  <div class="champs-de-saisie">
    <ChampDeSaisie
      bind:contenu={donneesModeleMesure.description}
      aideSaisie="Indiquez un intitulé clair pour votre mesure"
      label="Intitulé de la mesure"
      requis
    />
    <ChampDeSaisie
      aideSaisie="Apportez des précisions sur la mesure"
      label="Description de la mesure"
      bind:contenu={donneesModeleMesure.descriptionLongue}
    />
    <ListeDeroulante
      label="Catégorie"
      id="categorie"
      requis={true}
      options={categories.map(({ id, label }) => ({ label, valeur: id }))}
      bind:valeur={donneesModeleMesure.categorie}
    />
  </div>
</div>

<style lang="scss">
  h3 {
    margin: 2px 0 0 0;
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .contenu-formulaire {
    display: flex;
    gap: 16px;
    flex-direction: column;

    .info-champ-obligatoire {
      text-align: right;
      font-size: 0.875rem;
      width: 700px;

      &:before {
        content: '*';
        color: var(--erreur-texte);
        margin-right: 4px;
        font-size: 1rem;
      }
    }

    .champs-de-saisie {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  }
</style>
