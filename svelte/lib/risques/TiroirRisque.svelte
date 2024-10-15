<script lang="ts">
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheIdentifiantRisque from '../ui/CartoucheIdentifiantRisque.svelte';
  import CartoucheCategorieRisque from '../ui/CartoucheCategorieRisque.svelte';
  import type {
    ReferentielGravites,
    ReferentielRisques,
    Risque,
  } from './risques.d';
  import { Referentiel } from '../ui/types.d';
  import SelectionGravite from './SelectionGravite.svelte';
  import { createEventDispatcher } from 'svelte';
  import Formulaire from '../ui/Formulaire.svelte';
  import Bouton from '../ui/Bouton.svelte';
  import ControleFormulaireTiroir from '../ui/ControleFormulaireTiroir.svelte';
  import ZoneTexte from '../ui/ZoneTexte.svelte';

  export let ouvert = true;
  export let risque: Risque | undefined;
  export let referentielRisques: ReferentielRisques;
  export let referentielCategories: Record<string, string>;
  export let referentielGravites: ReferentielGravites;
  export let estLectureSeule;

  $: risqueDuReferentiel =
    risque && risque.type === 'GENERAL' && referentielRisques[risque.id];

  const emet = createEventDispatcher<{
    metsAJourRisque: Risque;
  }>();

  const metsAJour = () => {
    if (risque) emet('metsAJourRisque', risque);
  };
</script>

<div class="tiroir" class:ouvert>
  {#if risque && risqueDuReferentiel}
    <div class="entete-tiroir">
      <div>
        <h3>Risque</h3>
        <h2 class="titre-tiroir">{risque.intitule}</h2>
        <div class="badges">
          <CartoucheIdentifiantRisque
            identifiant={risqueDuReferentiel.identifiantNumerique}
          />
          <CartoucheReferentiel referentiel={Referentiel.ANSSI} />
          {#each risque.categories as categorie}
            <CartoucheCategorieRisque
              libelleCategorie={referentielCategories[categorie]}
            />
          {/each}
        </div>
      </div>
      <button class="fermeture" on:click={() => (ouvert = false)}>✕</button>
    </div>
    <div class="contenu-risque">
      <Formulaire on:formulaireValide={metsAJour}>
        <div class="champs">
          <ControleFormulaireTiroir libelle="Description du risque">
            <span>{@html risqueDuReferentiel.descriptionLongue}</span>
          </ControleFormulaireTiroir>
          <ControleFormulaireTiroir libelle="Gravité potentielle">
            <SelectionGravite
              {referentielGravites}
              {estLectureSeule}
              avecLibelleOption={true}
              bind:niveauGravite={risque.niveauGravite}
            />
          </ControleFormulaireTiroir>
          <ControleFormulaireTiroir libelle="Commentaire">
            <ZoneTexte bind:valeur={risque.commentaire} />
          </ControleFormulaireTiroir>
        </div>
        <Bouton type="primaire" titre="Enregistrer" />
      </Formulaire>
    </div>
  {/if}
</div>

<style>
  .tiroir {
    height: 100%;
    min-width: 650px;
    max-width: 650px;
    position: fixed;
    left: 100vw;
    top: 0;
    overflow-y: scroll;
    transition: transform 0.2s ease-in-out;
    box-shadow: -10px 0 34px 0 #00000026;
    background: #fff;
    visibility: hidden;
    z-index: 20;
    display: flex;
    flex-direction: column;
  }

  .ouvert {
    transform: translateX(-100%);
    visibility: visible;
  }

  .entete-tiroir {
    background: #dbeeff;
    text-align: left;
    padding: 32px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .titre-tiroir {
    font-size: 1.625rem;
    margin: 0;
    padding-top: 7px;
  }

  .fermeture {
    font-weight: bold;
    background: none;
    width: 2em;
    height: 2em;
    cursor: pointer;
    border: none;
  }

  h3 {
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.375rem;
    color: var(--gris-fonce);
    margin: 0;
  }

  .badges {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }

  .contenu-risque {
    padding: 32px 36px;
    text-align: left;
  }

  .contenu-risque h1 {
    margin: 0 0 8px;
    font-weight: bold;
    font-size: 1rem;
    line-height: 1.375rem;
  }

  .champs {
    display: flex;
    gap: 30px;
    flex-direction: column;
  }
</style>
