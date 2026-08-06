<script lang="ts">
  import PagesService from '../pagesService/PagesService.svelte';
  import type {
    DonneesEtapeVisiteGuidee,
    EtapeVisiteGuidee,
    PageFondVisiteGuidee,
    VisiteGuideeSPAProps,
  } from './visiteGuideeSPA.d';
  import { donneesEtapesVisiteGuidee } from './visiteGuideeSPA.d';
  import AssistantServiceV2 from '../creationV2/AssistantServiceV2.svelte';
  import TableauDeBord from '../tableauDeBord/TableauDeBord.svelte';
  import CreationV2 from '../creationV2/CreationV2.svelte';
  import ModaleExplicative from './ModaleExplicative.svelte';

  let { referentiel, featureFlags, nonce }: VisiteGuideeSPAProps = $props();
  let etapeVisiteGuidee: EtapeVisiteGuidee = $state(1);
  let donneesEtape: DonneesEtapeVisiteGuidee = $derived(
    donneesEtapesVisiteGuidee[etapeVisiteGuidee]
  );
  let pageFondVisiteGuidee: PageFondVisiteGuidee = $derived(
    donneesEtape.pageFond
  );
</script>

<ModaleExplicative bind:etape={etapeVisiteGuidee} />

<div>
  {#if pageFondVisiteGuidee === 'creationV2'}
    <AssistantServiceV2
      titreAssistant="Ajouter un service"
      titreBoutonFinalise="Commencer à sécuriser le service"
      enCoursDeChargement={false}
    />
  {:else if pageFondVisiteGuidee === 'besoinsSecuriteV2'}
    <CreationV2
      modeVisiteGuidee={true}
      entite={{ siret: '1234', nom: '', departement: '75' }}
    />
  {:else if pageFondVisiteGuidee === 'tableauDeBord'}
    <div class="avec-padding">
      <TableauDeBord
        estSuperviseur={false}
        estAdmin={false}
        avecGestionOrganisations={false}
        modeVisiteGuidee={true}
        profilUtilisateurComplet={true}
      />
    </div>
  {:else if pageFondVisiteGuidee === 'mesures' || pageFondVisiteGuidee === 'dossiers' || pageFondVisiteGuidee === 'risques'}
    <PagesService
      etapeActive={pageFondVisiteGuidee}
      idService="ID-SERVICE-VISITE-GUIDEE"
      {referentiel}
      visible={{
        rolesResponsabilites: true,
        risques: true,
        descriptionService: true,
        mesures: true,
        indiceCyber: true,
        dossiers: true,
        homologation: true,
      }}
      estLectureSeule={{
        rolesResponsabilites: false,
        risques: false,
        descriptionService: false,
        mesures: false,
        indiceCyber: false,
        dossiers: false,
        homologation: false,
      }}
      modeVisiteGuidee={true}
      {featureFlags}
      preferencesUtilisateur={{
        afficheExplicationRisquesV2: false,
      }}
      suggestionsService={{
        finalisationDescriptionServiceImporte: false,
      }}
      peutHomologuer={true}
      {nonce}
    />
  {/if}
</div>

<style lang="scss">
  :global(#visite-guidee-spa) {
    padding: 0 !important;
  }

  .avec-padding {
    padding: 32px 20px;
  }

  .conteneur-actions {
    display: flex;
    gap: 16px;
    justify-content: end;
  }
</style>
