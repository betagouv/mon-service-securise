<script lang="ts">
  import type { DossiersHomologation } from './homologuer.types';
  import CarteDossier from './kit/CarteDossier.svelte';
  import OngletVide from './kit/OngletVide.svelte';
  import ModaleEncartHomologation from './kit/ModaleEncartHomologation.svelte';
  import { onMount } from 'svelte';

  interface Props {
    dossiers: DossiersHomologation;
    statutsHomologation: Record<string, { libelle: string }>;
    indiceCyber: number;
    indiceCyberPersonnalise: number;
    idService: string;
    documentsPdfDisponibles: string[];
  }

  let {
    idService,
    dossiers,
    statutsHomologation,
    indiceCyber,
    indiceCyberPersonnalise,
    documentsPdfDisponibles,
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

  let modaleEncarteHomologation: ModaleEncartHomologation;

  onMount(() => {
    const requete = new URLSearchParams(window.location.search);
    const avecSucces = requete.get('succesHomologation');
    if (avecSucces) modaleEncarteHomologation?.affiche();
  });
</script>

{#if !dossiers.aucunDossier}
  {@const dossierEnCours = !!dossiers.dossierCourant}
  <div class="bouton-creation">
    <dsfr-button
      label={dossierEnCours
        ? "Reprendre l'homologation"
        : "Créer un nouveau projet d'homologation"}
      kind="primary"
      size="sm"
      icon={dossierEnCours ? 'edit-box-line' : 'edit-line'}
      icon-place="left"
      markup="a"
      href={dossierEnCours
        ? `/service/${idService}/homologation/edition/etape/${dossiers.dossierCourant?.etapeCourante.nomEtape}`
        : `/service/${idService}/homologation/edition/etape/autorite`}
      type="button"
      has-icon
    ></dsfr-button>
  </div>
{/if}

{#if dossiers.aucunDossier}
  <OngletVide
    titre="Aucun projet d’homologation en cours"
    sousTitre="Aucun projet d’homologation n’est en cours, ni aucune homologation n’a été validée"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Créer un nouveau projet d'homologation"
      kind="primary"
      size="md"
      onclick={() =>
        (window.location.href = `/service/${idService}/homologation/edition/etape/autorite`)}
    ></dsfr-button>
  </OngletVide>
{:else}
  <dsfr-tabs tabs={configurationsTabs}>
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
        />
      {:else}
        <div class="onglet-vide">
          <OngletVide
            titre="Aucun projet d’homologation en cours"
            sousTitre="Aucun projet d’homologation n’est en cours pour ce service"
          />
        </div>
      {/if}
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
<ModaleEncartHomologation {idService} bind:this={modaleEncarteHomologation} />

<style lang="scss">
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
