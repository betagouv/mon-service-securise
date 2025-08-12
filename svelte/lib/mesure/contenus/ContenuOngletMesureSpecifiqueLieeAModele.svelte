<script lang="ts">
  import { store } from '../mesure.store';
  import type { ReferentielStatut } from '../../ui/types';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import type { MesureSpecifique } from '../mesure.d';
  import SelectionStatut from '../../ui/SelectionStatut.svelte';
  import ChampDeSaisie from '../../ui/ChampDeSaisie.svelte';
  import ListeDeroulante from '../../ui/ListeDeroulante.svelte';
  import Infobulle from '../../ui/Infobulle.svelte';
  import { onMount } from 'svelte';
  import Toast from '../../ui/Toast.svelte';

  export let categories: Record<string, string>;
  export let statuts: ReferentielStatut;
  export let estLectureSeule: boolean;
  export let etapeCouranteModeleMesureSpecifique: 1 | 2;

  let mesureSpecifique: MesureSpecifique;
  $: mesureSpecifique = $store.mesureEditee.mesure;
  $: estProprietaireDuModele =
    mesureSpecifique.idModele &&
    $modelesMesureSpecifique.find((m) => m.id === mesureSpecifique.idModele);
  $: contenuInfobulle = estProprietaireDuModele
    ? "Pour modifier l'intitulé, la description et la catégorie de cette mesure, veuillez vous rendre sur sa configuration dans votre liste de mesures."
    : 'Cette information est modifiable uniquement par le propriétaire de la mesure. Vous pouvez cependant supprimer cette mesure de votre service.';

  onMount(() => {
    etapeCouranteModeleMesureSpecifique = 1;
  });
</script>

<div class="conteneur-onglet-mesure-specifique">
  {#if etapeCouranteModeleMesureSpecifique === 1}
    <div>
      <div class="titre-avec-infobulle">
        <h4>Intitulé de la mesure</h4>
        <Infobulle contenu={contenuInfobulle} />
      </div>
      <span>{mesureSpecifique.description}</span>
    </div>
    <div>
      <div class="titre-avec-infobulle">
        <h4>Description de la mesure</h4>
        <Infobulle contenu={contenuInfobulle} />
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
          <Infobulle contenu={contenuInfobulle} />
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
  {:else}
    <h4>Souhaitez-vous vraiment supprimer cette mesure ?</h4>
    <Toast
      avecOmbre={false}
      avecAnimation={false}
      titre="Cette action est irréversible"
      niveau="alerte"
      contenu="Les données concernant cette mesure seront définitivement effacées sur ce service mais vous pourrez la retrouver dans la liste de mesures ajoutées. Les contributeurs n'auront plus accès à cette mesure."
    />
  {/if}
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
