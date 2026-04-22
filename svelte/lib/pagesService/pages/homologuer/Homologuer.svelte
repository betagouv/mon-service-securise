<script lang="ts">
  import type { DossiersHomologation } from './homologuer.types';
  import CarteDossier from './kit/CarteDossier.svelte';

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
</script>

{#if dossiers.aucunDossier}
  <div class="conteneur-projets-vide">
    <img
      src="/statique/assets/images/illustration_dossiers.svg"
      alt="Illustration du dossier d'homologation vide"
    />
    <div>
      <h4>Aucun projet d’homologation en cours</h4>
      <span>
        Aucun projet d’homologation n’est en cours, ni aucune homologation n’a
        été validée.
      </span>
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Créer un nouveau projet d'homologation"
      kind="primary"
      size="md"
      onclick={() =>
        (window.location.href = `/service/${idService}/homologation/edition/etape/autorite`)}
    ></dsfr-button>
  </div>
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
      {/if}
    </div>
    <div slot="panel-3" class="conteneur-onglet">
      {#each dossiers.dossiersPasses as dossier (dossier.id)}
        <CarteDossier {dossier} {statutsHomologation} {idService} />
      {/each}
    </div>
    <div slot="panel-4" class="conteneur-onglet">
      {#each dossiers.dossiersRefuses as dossier (dossier.id)}
        <CarteDossier
          {dossier}
          {statutsHomologation}
          avecStatutHomologation
          {idService}
        />
      {/each}
    </div>
  </dsfr-tabs>
{/if}

<style lang="scss">
  .conteneur-projets-vide {
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    align-items: center;
    max-width: 588px;
    color: #161616;
    margin: 0 auto;
    text-align: center;

    & > div {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }

    img {
      max-width: 200px;
    }

    h4 {
      font-weight: bold;
      font-size: 1.5rem;
      line-height: 2rem;
      margin: 0;
    }

    span {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
  }

  .conteneur-onglet {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
