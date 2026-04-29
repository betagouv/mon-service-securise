<script lang="ts">
  import type { DossiersHomologation } from './homologuer.types';
  import CarteDossier from './kit/CarteDossier.svelte';
  import OngletVide from './kit/OngletVide.svelte';
  import ModaleEncartHomologation from './kit/ModaleEncartHomologation.svelte';
  import { onMount } from 'svelte';
  import ModaleDemarcheIndicative from '../../kit/ModaleDemarcheIndicative.svelte';
  import type { IdNiveauDeSecurite } from '../../../ui/types';
  import { routeurStore } from '../../store/routeur.store';
  import TitreOngletDSFR from '../../../ui/TitreOngletDSFR.svelte';

  interface Props {
    dossiers: DossiersHomologation;
    estLectureSeule: boolean;
    statutsHomologation: Record<string, { libelle: string }>;
    indiceCyber: number;
    indiceCyberPersonnalise: number;
    idService: string;
    documentsPdfDisponibles: string[];
    niveauSecurite: IdNiveauDeSecurite;
  }

  let {
    idService,
    dossiers,
    estLectureSeule,
    statutsHomologation,
    indiceCyber,
    indiceCyberPersonnalise,
    documentsPdfDisponibles,
    niveauSecurite,
  }: Props = $props();

  const configurationsTabs = [
    {
      id: 'courant',
      label: 'Projet d’homologation en cours',
    },
    {
      id: 'actif',
      label: 'Dernière homologation',
    },
    {
      id: 'passees',
      label: 'Homologations passées',
    },
    {
      id: 'refusees',
      label: 'Homologations refusées',
    },
  ];

  let modaleEncartHomologation: ModaleEncartHomologation;
  let modaleDemarcheIndicative: ModaleDemarcheIndicative;
  let idTabActive: number = $state(0);

  onMount(() => {
    const requete = new URLSearchParams(window.location.search);
    const avecSucces = requete.get('succesHomologation');
    const tab = requete.get('tab');
    if (tab) {
      idTabActive = configurationsTabs.findIndex((ct) => ct.id === tab);
      if (idTabActive === -1) idTabActive = 0;
    }
    if (avecSucces) modaleEncartHomologation?.affiche();
  });

  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    idTabActive = e.detail.index;
  };
</script>

<ModaleDemarcheIndicative
  bind:this={modaleDemarcheIndicative}
  {niveauSecurite}
  onHomologuer={() =>
    routeurStore.navigue(
      `/service/${idService}/homologation/edition/etape/autorite`
    )}
/>

{#if dossiers.aucunDossier}
  <OngletVide
    titre="Aucun projet d’homologation en cours"
    sousTitre="Aucun projet d’homologation n’est en cours, ni aucune homologation n’a été validée"
  >
    {#if !estLectureSeule}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        onclick={() => modaleDemarcheIndicative.affiche()}
        label="Créer un nouveau projet d'homologation"
        kind="primary"
        size="md"
        nom="creer-homologation"
        id="creer-homologation"
      ></dsfr-button>
    {/if}
  </OngletVide>
{:else}
  <dsfr-tabs
    tabs={configurationsTabs}
    activeTabIndex={idTabActive}
    ontabchanged={gereChangementTab}
  >
    <div slot="tab-1">
      <TitreOngletDSFR
        active={idTabActive === 0}
        libelle={configurationsTabs[0].label}
        libellePastille={dossiers.dossierCourant ? '1' : undefined}
      />
    </div>
    <div slot="panel-1" class="conteneur-onglet">
      {#if dossiers.dossierCourant}
        <CarteDossier
          dossier={{
            ...dossiers.dossierCourant,
            indiceCyber,
            indiceCyberPersonnalise,
          }}
          {statutsHomologation}
          {idService}
          avecDocumentsAccessible
          {documentsPdfDisponibles}
          peutSupprimer={!estLectureSeule}
        />
      {:else}
        <div class="onglet-vide">
          <OngletVide
            titre="Aucun projet d’homologation en cours"
            sousTitre="Aucun projet d’homologation n’est en cours pour ce service"
          >
            {#if !estLectureSeule}
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <dsfr-button
                onclick={() => modaleDemarcheIndicative.affiche()}
                label="Créer un nouveau projet d'homologation"
                kind="primary"
                size="md"
              ></dsfr-button>
            {/if}
          </OngletVide>
        </div>
      {/if}
    </div>

    <div slot="tab-2">
      <TitreOngletDSFR
        active={idTabActive === 1}
        libelle={configurationsTabs[1].label}
        libellePastille={dossiers.dossierActif ? '1' : undefined}
      />
    </div>
    <div slot="panel-2" class="conteneur-onglet">
      {#if dossiers.dossierActif}
        <CarteDossier
          dossier={dossiers.dossierActif}
          {statutsHomologation}
          avecStatutHomologation
          avecTamponAccessible
          {idService}
        />
      {:else}
        <div class="onglet-vide">
          <OngletVide
            titre="Aucune homologation active"
            sousTitre="Aucun projet d’homologation n’est actif pour ce service"
          />
        </div>
      {/if}
    </div>

    <div slot="tab-3">
      <TitreOngletDSFR
        active={idTabActive === 2}
        libelle={configurationsTabs[2].label}
        libellePastille={dossiers.dossiersPasses.length > 0
          ? dossiers.dossiersPasses.length.toString()
          : undefined}
      />
    </div>
    <div slot="panel-3" class="conteneur-onglet">
      {#if dossiers.dossiersPasses.length === 0}
        <div class="onglet-vide">
          <OngletVide
            titre="Aucune homologation passée"
            sousTitre="Aucun projet d’homologation n’est archivé pour ce service"
          />
        </div>
      {:else}
        {#each dossiers.dossiersPasses as dossier (dossier.id)}
          <CarteDossier {dossier} {statutsHomologation} {idService} />
        {/each}
      {/if}
    </div>

    <div slot="tab-4">
      <TitreOngletDSFR
        active={idTabActive === 3}
        libelle={configurationsTabs[3].label}
        libellePastille={dossiers.dossiersRefuses.length > 0
          ? dossiers.dossiersRefuses.length.toString()
          : undefined}
      />
    </div>
    <div slot="panel-4" class="conteneur-onglet">
      {#if dossiers.dossiersRefuses.length === 0}
        <div class="onglet-vide">
          <OngletVide
            titre="Aucune homologation refusée"
            sousTitre="Aucun projet d’homologation n’a été refusé pour ce service"
          />
        </div>
      {:else}
        {#each dossiers.dossiersRefuses as dossier (dossier.id)}
          <CarteDossier
            {dossier}
            {statutsHomologation}
            avecStatutHomologation
            {idService}
          />
        {/each}
      {/if}
    </div>
  </dsfr-tabs>
{/if}

<ModaleEncartHomologation {idService} bind:this={modaleEncartHomologation} />

<style lang="scss">
  :global #formulaire-suppression-dossier-courant {
    .requis {
      position: relative;
    }

    .requis::before {
      position: absolute;
      left: -1em;
      content: '*';
      color: var(--rose-anssi);
    }

    .message-erreur {
      position: relative;
      display: none;
      margin: 1em 0;
      color: var(--rose-anssi);
      font-weight: normal;
      align-items: center;
      flex-direction: row;
      gap: 8px;
    }

    .message-erreur::before {
      content: '';
      display: flex;
      flex-shrink: 0;
      background-image: url(/statique/assets/images/icone_attention_rose.svg);
      background-repeat: no-repeat;
      background-size: contain;
      width: 24px;
      height: 24px;
    }

    :is(input, select, textarea).touche:invalid ~ .message-erreur {
      display: flex;
    }
  }

  .conteneur-onglet {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .onglet-vide {
    padding: 48px 0;
  }

  .bouton-creation {
    position: absolute;
    top: 32px;
    right: 24px;
  }
</style>
