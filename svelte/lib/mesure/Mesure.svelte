<script lang="ts">
  import Formulaire from '../ui/Formulaire.svelte';
  import SuppressionMesureSpecifique from './suppression/SuppressionMesureSpecifique.svelte';
  import type {
    IdService,
    MesureGenerale,
    MesureSpecifique,
  } from '../tableauDesMesures/tableauDesMesures.d';

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
  import { encode } from 'html-entities';
  import { ciblage } from '../visiteGuidee/ciblage';
  import ContenuTiroir from '../ui/tiroirs/ContenuTiroir.svelte';
  import EnteteTiroir from './entete/EnteteTiroir.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import type { VersionService } from '../../../src/modeles/versionService';
  import type {
    MesureGeneraleEnrichie,
    MesuresReferentielsExternes,
  } from './mesure';
  import ContenuOngletReferentielsExternes from './contenus/ContenuOngletReferentielsExternes.svelte';

  interface Props {
    idService: IdService;
    categories: Record<string, string>;
    statuts: ReferentielStatut;
    retoursUtilisateur: Record<string, string>;
    estLectureSeule: boolean;
    priorites: ReferentielPriorite;
    modeVisiteGuidee: boolean;
    nonce: string;
    versionService: VersionService;
  }

  let {
    idService,
    categories,
    statuts,
    retoursUtilisateur,
    estLectureSeule,
    priorites,
    modeVisiteGuidee,
    nonce,
    versionService,
  }: Props = $props();

  export const titre =
    $store.etape === 'Creation'
      ? 'Ajouter une mesure'
      : $store.mesureEditee.mesure.description;
  export const composantEntete = EnteteTiroir;
  export const taille = 'large';

  const statutInitial = $store.mesureEditee.mesure.statut;

  let enCoursEnvoi = $state(false);

  const rafraichisListeMesure = () => {
    document.body.dispatchEvent(
      new CustomEvent('mesure-modifiee', {
        detail: { sourceDeModification: 'tiroir' },
      })
    );
  };

  const fermeTiroir = () => {
    tiroirStore.ferme();
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
    if (statutInitial !== $store.mesureEditee.mesure.statut) {
      toasterStore.afficheToastChangementStatutMesure(
        $store.mesureEditee.mesure as MesureGenerale | MesureSpecifique,
        statuts
      );
    }
    rafraichisListeMesure();
    fermeTiroir();
  };

  let retourUtilisateur: string = $state('');
  let commentaireRetourUtilisateur: string = $state('');
  let ongletActif: string = $state('mesure');

  const activeOngletMesure = () => {
    ongletActif = 'mesure';
  };

  let doitAfficherActions = $derived(ongletActif !== 'activite');
  let contenuCommentaire: string = $state('');
  const sauvegardeCommentaire = async () => {
    const idMesure =
      $store.mesureEditee.metadonnees.typeMesure === 'GENERALE'
        ? ($store.mesureEditee.metadonnees.idMesure as string)
        : $store.mesureEditee.mesure.id;
    await enregistreCommentaire(idService, idMesure, contenuCommentaire);
    document.body.dispatchEvent(new CustomEvent('activites-modifiees'));
  };

  let doitAfficherTiroirModeleMesureSpecifique = $derived(
    ongletActif === 'mesure' &&
      'idModele' in $store.mesureEditee.mesure &&
      !!$store.mesureEditee.mesure.idModele
  );

  let etapeCouranteModeleMesureSpecifique: 1 | 2 = $state(1);

  const supprimeMesureSpecifiqueAssocieeAuModele = async () => {
    if (
      !('idModele' in $store.mesureEditee.mesure) ||
      !$store.mesureEditee.mesure.idModele
    )
      return;
    enCoursEnvoi = true;
    const nomMesure = $store.mesureEditee.mesure.description;
    try {
      await supprimeMesureSpecifiqueAssocieeAUnModele(
        $store.mesureEditee.mesure.idModele,
        idService
      );
      toasterStore.succes(
        'Mesure supprimée avec succès !',
        `Vous avez supprimé la mesure <b>${encode(nomMesure)}</b>.`,
        true
      );
      rafraichisListeMesure();
      fermeTiroir();
    } catch {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursEnvoi = false;
    }
  };

  let mesuresReferentielsExternes: MesuresReferentielsExternes = $derived(
    ($store.mesureEditee.mesure as MesureGeneraleEnrichie)
      .mesuresReferentielsExternes ?? { ReCyf: [] }
  );

  let avecOngletReferentielsExterne = $derived(
    versionService === 'v2' &&
      $store.mesureEditee.metadonnees.typeMesure === 'GENERALE' &&
      mesuresReferentielsExternes.ReCyf.length > 0
  );

  let nombreMesuresReferentielsExternes = $derived(
    avecOngletReferentielsExterne
      ? mesuresReferentielsExternes.ReCyf.length
      : undefined
  );
</script>

{#if $store.etape === 'SuppressionSpecifique'}
  <ContenuTiroir>
    <SuppressionMesureSpecifique {idService} />
  </ContenuTiroir>
{:else}
  <Formulaire
    onFormulaireValide={enregistreMesure}
    id="formulaire-mesure"
    onFormulaireInvalide={activeOngletMesure}
    formulaireDuTiroir
  >
    <ContenuTiroir>
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
          idVisiteGuidee={ciblage().securiser().planAction().id()}
          sansBordureEnBas
          badge={!planDActionDisponible($store.mesureEditee.mesure.statut)
            ? 'info'
            : 0}
        />
        <Onglet
          bind:ongletActif
          cetOnglet="activite"
          labelOnglet="Activité"
          idVisiteGuidee={ciblage().securiser().activite().id()}
          sansBordureEnBas
        />
        {#if avecOngletReferentielsExterne}
          <Onglet
            bind:ongletActif
            cetOnglet="referentiels-externes"
            labelOnglet="Référentiel d’exigences"
            sansBordureEnBas
            badge={nombreMesuresReferentielsExternes}
          />
        {/if}
      </div>
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
        {#if avecOngletReferentielsExterne}
          <ContenuOngletReferentielsExternes
            visible={ongletActif === 'referentiels-externes'}
            {mesuresReferentielsExternes}
          />
        {/if}
      </div>
    </ContenuTiroir>
    <div class="conteneur-actions">
      {#if doitAfficherActions}
        {#if doitAfficherTiroirModeleMesureSpecifique}
          <div class="conteneur-boutons-modele-mesure-specifique">
            {#if estLectureSeule}
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <lab-anssi-bouton
                titre="Fermer"
                variante="primaire"
                taille="md"
                onclick={fermeTiroir}
              ></lab-anssi-bouton>
            {:else if etapeCouranteModeleMesureSpecifique === 1}
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <lab-anssi-bouton
                titre="Supprimer la mesure du service"
                variante="tertiaire-sans-bordure"
                taille="md"
                icone="delete-line"
                position-icone="gauche"
                onclick={() => (etapeCouranteModeleMesureSpecifique = 2)}
              ></lab-anssi-bouton>
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <lab-anssi-bouton
                titre="Enregistrer"
                variante="primaire"
                taille="md"
                icone="save-line"
                position-icone="gauche"
                actif={!enCoursEnvoi}
                onclick={() => enregistreMesure()}
              ></lab-anssi-bouton>
            {:else}
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <lab-anssi-bouton
                titre="Annuler"
                variante="tertiaire-sans-bordure"
                taille="md"
                onclick={fermeTiroir}
              ></lab-anssi-bouton>
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <lab-anssi-bouton
                titre="Confirmer la suppression"
                variante="primaire"
                taille="md"
                icone="delete-line"
                position-icone="gauche"
                actif={!enCoursEnvoi}
                onclick={() => supprimeMesureSpecifiqueAssocieeAuModele()}
              ></lab-anssi-bouton>
            {/if}
          </div>
        {:else}
          {#if $configurationAffichage.doitAfficherSuppression}
            <button type="button" onclick={store.afficheEtapeSuppression}>
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
          onsubmit={sauvegardeCommentaire}
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
    border-top: 1px solid #cbd5e1;
    padding: 16px 24px;
    background: white;
    flex-grow: 0;
    flex-shrink: 0;
    z-index: 2;
  }

  .conteneur-actions button[type='submit'] {
    margin-left: auto;
    background: #0079d0;
    color: white;
    padding: 9px 16px;
  }

  .conteneur-actions button {
    font-weight: 500;
    color: #0079d0;
    cursor: pointer;
    margin: 0;
    padding: 0;
    background: none;
    border: none;
    display: flex;
    align-items: center;
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
  }

  .conteneur-boutons-modele-mesure-specifique {
    display: flex;
    align-items: end;
    gap: 10px;
    margin-left: auto;
  }
</style>
