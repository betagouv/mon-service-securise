<script context="module" lang="ts">
  export type ModeAffichageTiroir = 'AJOUT' | 'EDITION' | '';
</script>

<script lang="ts">
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheCategorieRisque from '../ui/CartoucheCategorieRisque.svelte';
  import type {
    ReferentielCategories,
    ReferentielGravites,
    ReferentielRisques,
    ReferentielVraisemblances,
    Risque,
  } from './risques.d';
  import { Referentiel } from '../ui/types.d';
  import SelectionGravite from './SelectionGravite.svelte';
  import { createEventDispatcher } from 'svelte';
  import Formulaire from '../ui/Formulaire.svelte';
  import Bouton from '../ui/Bouton.svelte';
  import ControleFormulaireTiroir from '../ui/ControleFormulaireTiroir.svelte';
  import ZoneTexte from '../ui/ZoneTexte.svelte';
  import {
    ajouteRisqueSpecifique,
    enregistreRisque,
    supprimeRisqueSpecifique,
  } from './risque.api';
  import SelectionCategorieRisque from './SelectionCategorieRisque.svelte';
  import { intituleRisque } from './risques';
  import SelectionVraisemblance from './SelectionVraisemblance.svelte';
  import Avertissement from '../ui/Avertissement.svelte';
  import IdentifiantRisque from './IdentifiantRisque.svelte';

  export let ouvert = true;
  export let risque: Risque | undefined;
  export let referentielRisques: ReferentielRisques;
  export let referentielCategories: ReferentielCategories;
  export let referentielGravites: ReferentielGravites;
  export let referentielVraisemblances: ReferentielVraisemblances;
  export let estLectureSeule;
  export let idService: string;
  export let modeAffichageTiroir: ModeAffichageTiroir = '';
  let enCoursEnvoi: boolean = false;

  $: risqueDuReferentiel =
    risque && risque.type === 'GENERAL' && referentielRisques[risque.id];

  const emet = createEventDispatcher<{
    risqueMisAJour: Risque;
    risqueSupprime: Risque;
    risqueAjoute: Risque;
  }>();

  const fermeTiroir = () => {
    ouvert = false;
    afficheConfirmationSuppressionRisque = false;
  };

  const metsAJour = async () => {
    if (risque) {
      try {
        enCoursEnvoi = true;
        await enregistreRisque(idService, risque);
        emet('risqueMisAJour', risque);
        fermeTiroir();
      } finally {
        enCoursEnvoi = false;
      }
    }
  };

  const ajoute = async () => {
    if (risque) {
      try {
        enCoursEnvoi = true;
        const risqueAjoute = await ajouteRisqueSpecifique(idService, risque);
        emet('risqueAjoute', risqueAjoute);
        fermeTiroir();
      } finally {
        enCoursEnvoi = false;
      }
    }
  };
  $: titreTiroir =
    risque && modeAffichageTiroir === 'EDITION'
      ? intituleRisque(risque)
      : 'Ajouter un risque';

  let afficheConfirmationSuppressionRisque = false;
  const supprimeRisque = async () => {
    if (risque && risque.type === 'SPECIFIQUE') {
      try {
        enCoursEnvoi = true;
        await supprimeRisqueSpecifique(idService, risque);
        emet('risqueSupprime', risque);
        fermeTiroir();
      } finally {
        enCoursEnvoi = false;
      }
    }
  };

  $: risque, (afficheConfirmationSuppressionRisque = false);
</script>

<div class="tiroir {risque?.type}" class:ouvert>
  {#if risque}
    <div class="entete-tiroir">
      <div>
        <h3>Risque</h3>
        <h2 class="titre-tiroir">{titreTiroir}</h2>
        <div class="badges">
          <IdentifiantRisque
            {risque}
            niveauxGravite={referentielGravites}
            niveauxVraisemblance={referentielVraisemblances}
          />
          {#if risqueDuReferentiel}
            <CartoucheReferentiel referentiel={Referentiel.ANSSI} />
            {#each risque.categories as categorie}
              <CartoucheCategorieRisque
                libelleCategorie={referentielCategories[categorie]}
              />
            {/each}
          {:else if modeAffichageTiroir === 'EDITION'}
            <CartoucheReferentiel referentiel={Referentiel.RISQUE_SPECIFIQUE} />
          {/if}
        </div>
      </div>
      <button class="fermeture" on:click={fermeTiroir}>✕</button>
    </div>
    <div class="contenu-risque">
      {#if afficheConfirmationSuppressionRisque}
        <div class="contenu-confirmation-suppression">
          <span> Souhaitez-vous vraiment supprimer ce risque ? </span>
          <Avertissement niveau="info">
            <strong>Cette action est irréversible</strong>
            <span>
              Les données seront définitivement effacées. Les contributeurs
              n'auront plus accès à ce risque.
            </span>
          </Avertissement>
          <div class="conteneur-actions-suppression">
            <Bouton
              titre="Annuler"
              type="secondaire"
              boutonSoumission={false}
              on:click={() => {
                afficheConfirmationSuppressionRisque = false;
              }}
            />
            <Bouton
              type="primaire"
              boutonSoumission={false}
              {enCoursEnvoi}
              on:click={supprimeRisque}
              titre="Confirmer la suppression"
            />
          </div>
        </div>
      {:else}
        <Formulaire
          on:formulaireValide={modeAffichageTiroir === 'EDITION'
            ? metsAJour
            : ajoute}
          classe="formulaire-risque"
        >
          <div class="champs">
            {#if risqueDuReferentiel}
              <ControleFormulaireTiroir libelle="Description du risque">
                <span class="description-longue-risque"
                  >{@html risqueDuReferentiel.descriptionLongue}</span
                >
              </ControleFormulaireTiroir>
            {/if}
            {#if risque.type === 'SPECIFIQUE'}
              <ControleFormulaireTiroir
                libelle="Intitulé du risque"
                requis={true}
              >
                <ZoneTexte
                  aideSaisie="Titre du risque"
                  bind:valeur={risque.intitule}
                  messageErreur="L'intitulé est obligatoire. Veuillez le renseigner."
                  requis={true}
                  lignes={2}
                />
              </ControleFormulaireTiroir>
              <ControleFormulaireTiroir libelle="Description du risque">
                <ZoneTexte
                  aideSaisie="Ce risque signifie que…"
                  lignes={6}
                  bind:valeur={risque.description}
                />
              </ControleFormulaireTiroir>
              <ControleFormulaireTiroir libelle="Catégorie" requis={true}>
                <SelectionCategorieRisque
                  bind:valeurs={risque.categories}
                  {referentielCategories}
                  requis={true}
                />
              </ControleFormulaireTiroir>
            {/if}
            <div class="deuxSelecteursParLigne">
              <ControleFormulaireTiroir libelle="Gravité potentielle">
                <SelectionGravite
                  {referentielGravites}
                  {estLectureSeule}
                  avecLibelleOption={true}
                  bind:niveauGravite={risque.niveauGravite}
                />
              </ControleFormulaireTiroir>
              <ControleFormulaireTiroir libelle="Vraisemblance initiale">
                <SelectionVraisemblance
                  {referentielVraisemblances}
                  {estLectureSeule}
                  avecLibelleOption={true}
                  bind:niveauVraisemblance={risque.niveauVraisemblance}
                />
              </ControleFormulaireTiroir>
            </div>
            <ControleFormulaireTiroir libelle="Commentaire">
              <ZoneTexte
                bind:valeur={risque.commentaire}
                aideSaisie="Apportez des précisions sur le risque"
                lignes={4}
              />
            </ControleFormulaireTiroir>
          </div>
          <div class="conteneur-actions">
            {#if risque.type === 'SPECIFIQUE' && modeAffichageTiroir === 'EDITION'}
              <Bouton
                type="lien"
                icone="suppression"
                titre="Supprimer le risque"
                boutonSoumission={false}
                on:click={() => {
                  afficheConfirmationSuppressionRisque = true;
                }}
              />
            {/if}
            <Bouton
              type="primaire"
              titre={modeAffichageTiroir === 'EDITION'
                ? 'Enregistrer'
                : 'Ajouter un risque'}
              {enCoursEnvoi}
            />
          </div>
        </Formulaire>
      {/if}
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
  }

  .GENERAL .titre-tiroir {
    padding-top: 7px;
  }

  .SPECIFIQUE .titre-tiroir {
    padding-top: 0;
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

  .SPECIFIQUE h3 {
    display: none;
  }

  .badges {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }

  .contenu-risque {
    text-align: left;
    padding: 0;
    display: flex;
    flex: 1;
  }

  .champs {
    display: flex;
    gap: 30px;
    flex-direction: column;
    padding: 32px 32px;
    flex: 1;
  }

  .conteneur-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: sticky;
    bottom: 0;
    border-top: 1px solid #cbd5e1;
    padding: 19px 32px;
    background: white;
    flex-grow: 0;
    flex-shrink: 0;
    gap: 10px;
  }

  .contenu-confirmation-suppression {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .conteneur-actions-suppression {
    display: flex;
    gap: 10px;
    flex-direction: row;
    justify-content: end;
  }

  .deuxSelecteursParLigne {
    display: flex;
    gap: 24px;
  }

  :global(.deuxSelecteursParLigne label) {
    flex: 1 0 0;
  }

  :global(.formulaire-risque) {
    flex: 1;
  }

  :global(.description-longue-risque h3) {
    margin: 24px 0 8px;
    font-size: 1rem;
    line-height: 1.375rem;
  }

  :global(.description-longue-risque ul) {
    color: var(--texte-clair);
    padding-left: 24px;
    margin: 8px 0 0;
  }

  :global(.description-longue-risque li) {
    margin-bottom: 16px;
  }
</style>
