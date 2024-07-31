<script lang="ts">
  import Formulaire from '../ui/Formulaire.svelte';
  import SuppressionMesureSpecifique from './suppression/SuppressionMesureSpecifique.svelte';
  import type { MesuresExistantes } from './mesure.d';

  import { configurationAffichage, store } from './mesure.store';
  import { enregistreMesures, enregistreRetourUtilisateur } from './mesure.api';
  import { toasterStore } from '../ui/stores/toaster.store';
  import Onglet from '../ui/Onglet.svelte';
  import { featureFlags } from '../featureFlags';
  import ContenuOngletMesure from './contenus/ContenuOngletMesure.svelte';
  import type { ReferentielStatut } from '../ui/types';
  import ContenuOngletPlanAction from './contenus/ContenuOngletPlanAction.svelte';

  export let idService: string;
  export let categories: Record<string, string>;
  export let statuts: ReferentielStatut;
  export let retoursUtilisateur: Record<string, string>;
  export let mesuresExistantes: MesuresExistantes;
  export let estLectureSeule: boolean;

  let enCoursEnvoi = false;
  const enregistreMesure = async () => {
    enCoursEnvoi = true;
    const promesses = [enregistreMesures(idService, mesuresExistantes, $store)];
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
    document.body.dispatchEvent(
      new CustomEvent('mesure-modifiee', {
        detail: { sourceDeModification: 'tiroir' },
      })
    );
    toasterStore.afficheToastChangementStatutMesure(
      $store.mesureEditee.mesure,
      statuts
    );
  };

  let retourUtilisateur: string;
  let commentaireRetourUtilisateur: string;
  let ongletActif: string = 'mesure';

  const activeOngletMesure = () => {
    ongletActif = 'mesure';
  };
</script>

{#if $store.etape === 'SuppressionSpecifique'}
  <SuppressionMesureSpecifique {idService} {mesuresExistantes} />
{:else}
  {#if featureFlags.planAction()}
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
      />
    </div>
  {/if}

  <Formulaire
    on:formulaireValide={enregistreMesure}
    id="formulaire-mesure"
    on:formulaireInvalide={activeOngletMesure}
  >
    <div class="corps-formulaire">
      <ContenuOngletMesure
        visible={ongletActif === 'mesure'}
        {estLectureSeule}
        {categories}
        {retoursUtilisateur}
        {statuts}
        bind:retourUtilisateur
        bind:commentaireRetourUtilisateur
      />
      <ContenuOngletPlanAction
        visible={ongletActif === 'planAction'}
        {estLectureSeule}
      />
    </div>
    <div class="conteneur-actions">
      {#if $configurationAffichage.doitAfficherSuppression}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p on:click={store.afficheEtapeSuppression}>Supprimer la mesure</p>
      {/if}
      <button
        type="submit"
        class="bouton"
        class:en-cours-chargement={enCoursEnvoi}
        disabled={enCoursEnvoi}
        >Enregistrer
      </button>
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
  }

  .conteneur-actions p {
    font-weight: 500;
    color: #0079d0;
    cursor: pointer;
    margin: 0 0 0 2em;
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
</style>
