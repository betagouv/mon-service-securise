<script lang="ts">
  import Formulaire from '../ui/Formulaire.svelte';
  import SuppressionMesureSpecifique from './suppression/SuppressionMesureSpecifique.svelte';
  import type { IdService } from '../tableauDesMesures/tableauDesMesures.d';

  import { configurationAffichage, store } from './mesure.store';
  import {
    enregistreCommentaire,
    enregistreMesures,
    enregistreRetourUtilisateur,
    supprimeMesureSpecifiqueAssocieeAUnModele,
  } from './mesure.api';
  import { toasterStore } from '../ui/stores/toaster.store';
  import Onglet from '../ui/Onglet.svelte';
  import ContenuOngletMesure from './contenus/ContenuOngletMesure.svelte';
  import type { ReferentielPriorite, ReferentielStatut } from '../ui/types';
  import ContenuOngletPlanAction from './contenus/ContenuOngletPlanAction.svelte';
  import { planDActionDisponible } from '../modeles/modeleMesure';
  import ContenuOngletActivite from './contenus/ContenuOngletActivite.svelte';
  import CommentaireMesure from './commentaire/CommentaireMesure.svelte';
  import ContenuOngletMesureSpecifiqueLieeAModele from './contenus/ContenuOngletMesureSpecifiqueLieeAModele.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';

  export let idService: IdService;
  export let categories: Record<string, string>;
  export let statuts: ReferentielStatut;
  export let retoursUtilisateur: Record<string, string>;
  export let estLectureSeule: boolean;
  export let priorites: ReferentielPriorite;
  export let modeVisiteGuidee: boolean;
  export let nonce: string;
  export let afficheModelesMesureSpecifique: boolean;

  const statutInitial = $store.mesureEditee.mesure.statut;

  let enCoursEnvoi = false;

  const rafraichisListeMesure = () => {
    document.body.dispatchEvent(
      new CustomEvent('mesure-modifiee', {
        detail: { sourceDeModification: 'tiroir' },
      })
    );
  };

  const fermeTiroir = () => {
    document.body.dispatchEvent(new CustomEvent('ferme-tiroir'));
  };

  const enregistreMesure = async () => {
    enCoursEnvoi = true;
    const promesses = [enregistreMesures(idService, $store)];
    if (
      $configurationAffichage.doitAfficherRetourUtilisateur &&
      retourUtilisateur
    ) {
      promesses.push(
        enregistreRetourUtilisateur(
          idService,
          $store.mesureEditee.metadonnees.idMesure as string,
          retourUtilisateur,
          commentaireRetourUtilisateur
        )
      );
    }
    await Promise.all(promesses);
    enCoursEnvoi = false;
    rafraichisListeMesure();
    if (statutInitial !== $store.mesureEditee.mesure.statut) {
      toasterStore.afficheToastChangementStatutMesure(
        $store.mesureEditee.mesure,
        statuts
      );
    }
  };

  let retourUtilisateur: string;
  let commentaireRetourUtilisateur: string;
  let ongletActif: string = 'mesure';

  const activeOngletMesure = () => {
    ongletActif = 'mesure';
  };

  $: doitAfficherActions = ongletActif !== 'activite';
  let contenuCommentaire: string = '';
  const sauvegardeCommentaire = async () => {
    const idMesure =
      $store.mesureEditee.metadonnees.typeMesure === 'GENERALE'
        ? ($store.mesureEditee.metadonnees.idMesure as string)
        : $store.mesureEditee.mesure.id;
    await enregistreCommentaire(idService, idMesure, contenuCommentaire);
    document.body.dispatchEvent(new CustomEvent('activites-modifiees'));
  };

  $: doitAfficherTiroirModeleMesureSpecifique =
    afficheModelesMesureSpecifique &&
    ongletActif === 'mesure' &&
    !!$store.mesureEditee.mesure.idModele;

  let etapeCouranteModeleMesureSpecifique: 1 | 2 = 1;

  const supprimeMesureSpecifiqueAssocieeAuModele = async () => {
    enCoursEnvoi = true;
    const nomMesure = $store.mesureEditee.mesure.description;
    try {
      await supprimeMesureSpecifiqueAssocieeAUnModele(
        $store.mesureEditee.mesure.idModele,
        idService
      );
      rafraichisListeMesure();
      toasterStore.succes(
        'Mesure supprimée avec succès !',
        `Vous avez supprimé la mesure <b>${nomMesure}</b>.`
      );
    } catch (e) {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursEnvoi = false;
    }
  };
</script>

{#if $store.etape === 'SuppressionSpecifique'}
  <SuppressionMesureSpecifique {idService} />
{:else}
  <div class="conteneur-onglet">
    <Onglet
      bind:ongletActif
      cetOnglet="mesure"
      labelOnglet="Mesure"
      sansBordureEnBas
    />
    <Onglet
      bind:ongletActif
      cetOnglet="planAction"
      labelOnglet="Plan d'action"
      sansBordureEnBas
      badge={!planDActionDisponible($store.mesureEditee.mesure.statut) &&
        'info'}
    />
    <Onglet
      bind:ongletActif
      cetOnglet="activite"
      labelOnglet="Activité"
      sansBordureEnBas
    />
  </div>

  <Formulaire
    on:formulaireValide={enregistreMesure}
    id="formulaire-mesure"
    on:formulaireInvalide={activeOngletMesure}
  >
    <div class="corps-formulaire">
      {#if doitAfficherTiroirModeleMesureSpecifique}
        <ContenuOngletMesureSpecifiqueLieeAModele
          {estLectureSeule}
          {categories}
          {statuts}
          bind:etapeCouranteModeleMesureSpecifique
        />
      {:else}
        <ContenuOngletMesure
          visible={ongletActif === 'mesure'}
          {estLectureSeule}
          {categories}
          {retoursUtilisateur}
          {statuts}
          bind:retourUtilisateur
          bind:commentaireRetourUtilisateur
        />
      {/if}
      <ContenuOngletPlanAction
        visible={ongletActif === 'planAction'}
        {estLectureSeule}
        {statuts}
        {priorites}
      />
      <ContenuOngletActivite
        visible={ongletActif === 'activite'}
        {priorites}
        {statuts}
        {idService}
        {modeVisiteGuidee}
      />
    </div>
    <div class="conteneur-actions">
      {#if doitAfficherActions}
        {#if doitAfficherTiroirModeleMesureSpecifique}
          <div class="conteneur-boutons-modele-mesure-specifique">
            {#if estLectureSeule}
              <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
              <lab-anssi-bouton
                titre="Fermer"
                variante="primaire"
                taille="md"
                on:click={fermeTiroir}
              />
            {:else if etapeCouranteModeleMesureSpecifique === 1}
              <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
              <lab-anssi-bouton
                titre="Supprimer la mesure du service"
                variante="tertiaire-sans-bordure"
                taille="md"
                icone="delete-line"
                position-icone="gauche"
                on:click={() => (etapeCouranteModeleMesureSpecifique = 2)}
              />
              <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
              <lab-anssi-bouton
                titre="Enregistrer"
                variante="primaire"
                taille="md"
                icone="save-line"
                position-icone="gauche"
                actif={!enCoursEnvoi}
                on:click={() => enregistreMesure()}
              />
            {:else}
              <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
              <lab-anssi-bouton
                titre="Annuler"
                variante="tertiaire-sans-bordure"
                taille="md"
                on:click={fermeTiroir}
              />
              <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
              <lab-anssi-bouton
                titre="Confirmer la suppression"
                variante="primaire"
                taille="md"
                icone="delete-line"
                position-icone="gauche"
                actif={!enCoursEnvoi}
                on:click={() => supprimeMesureSpecifiqueAssocieeAuModele()}
              />
            {/if}
          </div>
        {:else}
          {#if $configurationAffichage.doitAfficherSuppression}
            <button type="button" on:click={store.afficheEtapeSuppression}>
              Supprimer la mesure
            </button>
          {/if}
          <button
            type="submit"
            class="bouton"
            class:en-cours-chargement={enCoursEnvoi}
            disabled={enCoursEnvoi}
            >Enregistrer
          </button>
        {/if}
      {:else}
        <CommentaireMesure
          on:submit={sauvegardeCommentaire}
          bind:contenuCommentaire
          {nonce}
        />
      {/if}
    </div>
  </Formulaire>
{/if}

<style>
  .conteneur-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;
    width: calc(100% + 4em);
    margin: 24px 0 -2em -2em;
    border-top: 1px solid #cbd5e1;
    padding: 1em 0;
    background: white;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .conteneur-actions button[type='submit'] {
    margin-left: auto;
    margin-right: 2em;
    background: #0079d0;
    color: white;
    padding: 9px 16px;
  }

  .conteneur-actions button {
    font-weight: 500;
    color: #0079d0;
    cursor: pointer;
    margin: 0 0 0 2em;
    padding: 0;
    background: none;
    border: none;
    display: flex;
    align-items: center;
  }

  :global(.erreur-champ-saisie) {
    margin: 4px 0 0 0;
    color: var(--rose-anssi);
    font-weight: normal;
    flex-direction: row;
  }

  :global(.erreur-champ-saisie:before) {
    content: '';
    display: flex;
    background-image: url('/statique/assets/images/icone_attention_rose.svg');
    background-repeat: no-repeat;
    background-size: contain;
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  :global(textarea.invalide, select.invalide) {
    border-color: var(--rose-anssi);
  }

  :global(#formulaire-mesure),
  .corps-formulaire {
    flex-grow: 1;
  }

  .conteneur-onglet {
    display: flex;
    gap: 8px;
    margin-bottom: 26px;
  }

  .conteneur-boutons-modele-mesure-specifique {
    display: flex;
    align-items: end;
    gap: 10px;
    margin-left: auto;
    margin-right: 32px;
  }
</style>
