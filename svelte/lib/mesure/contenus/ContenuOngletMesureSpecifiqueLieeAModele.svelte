<script lang="ts">
  import { store } from '../mesure.store';
  import type { ReferentielStatut } from '../../ui/types';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import type { MesureSpecifique } from '../mesure.d';
  import SelectionStatut from '../../ui/SelectionStatut.svelte';
  import ChampDeSaisie from '../../ui/ChampDeSaisie.svelte';
  import ListeDeroulante from '../../ui/ListeDeroulante.svelte';
  import Infobulle from '../../ui/Infobulle.svelte';

  export let categories: Record<string, string>;
  export let statuts: ReferentielStatut;
  export let estLectureSeule: boolean;

  let mesureSpecifique: MesureSpecifique;
  $: mesureSpecifique = $store.mesureEditee.mesure;
  $: estProprietaireDuModele =
    mesureSpecifique.idModele &&
    $modelesMesureSpecifique.find((m) => m.id === mesureSpecifique.idModele);
</script>

<div class="conteneur-onglet-mesure-specifique">
  <div>
    <div class="titre-avec-infobulle">
      <h4>Intitulé de la mesure</h4>
      <Infobulle
        contenu="Pour modifier l'intitulé, la description et la catégorie de cette mesure, veuillez vous rendre sur sa configuration dans votre liste de mesures."
      />
    </div>
    <span>{mesureSpecifique.description}</span>
  </div>
  <div>
    <div class="titre-avec-infobulle">
      <h4>Description de la mesure</h4>
      <Infobulle
        contenu="Pour modifier l'intitulé, la description et la catégorie de cette mesure, veuillez vous rendre sur sa configuration dans votre liste de mesures."
      />
    </div>
    <span>{mesureSpecifique.descriptionLongue}</span>
  </div>
  <div>
    <ChampDeSaisie
      bind:contenu={$store.mesureEditee.mesure.modalites}
      aideSaisie="Apportez des précisions sur la mesure, ses modalités de mise en œuvre, etc."
      label="Précisions de la mesure"
      tailleMinimale={2}
    />
  </div>
  <div>
    <SelectionStatut
      bind:statut={mesureSpecifique.statut}
      id="statut"
      {estLectureSeule}
      referentielStatuts={statuts}
      label="Statut"
      requis
    />
    <div>
      <div class="titre-avec-infobulle">
        <h4>Catégorie</h4>
        <Infobulle
          contenu="Pour modifier l'intitulé, la description et la catégorie de cette mesure, veuillez vous rendre sur sa configuration dans votre liste de mesures."
        />
      </div>
      <ListeDeroulante
        label=""
        id="categorie"
        options={Object.entries(categories).map(([id, label]) => ({
          label,
          valeur: id,
        }))}
        bind:valeur={$store.mesureEditee.mesure.categorie}
        desactive
      />
    </div>
  </div>
</div>

<style lang="scss">
  .conteneur-onglet-mesure-specifique {
    display: flex;
    flex-direction: column;
    gap: 24px;
    & > div {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  h4 {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  span {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 400;
  }

  .titre-avec-infobulle {
    display: flex;
    gap: 4px;
    align-items: center;
  }
</style>
