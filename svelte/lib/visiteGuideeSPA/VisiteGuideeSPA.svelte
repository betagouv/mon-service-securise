<script lang="ts">
  import PagesService from '../pagesService/PagesService.svelte';
  import type {
    DonneesEtapeVisiteGuidee,
    EtapeVisiteGuidee,
    PageFondVisiteGuidee,
    RectCible,
    VisiteGuideeSPAProps,
  } from './visiteGuideeSPA.d';
  import AssistantServiceV2 from '../creationV2/AssistantServiceV2.svelte';
  import TableauDeBord from '../tableauDeBord/TableauDeBord.svelte';
  import CreationV2 from '../creationV2/CreationV2.svelte';
  import ModaleExplicative from './ModaleExplicative.svelte';
  import {
    donneesEtapesVisiteGuidee,
    donneesEtapesVisiteGuideeAdditionnelle,
  } from './visiteGuideeSPA.donnees';
  import { onMount, tick } from 'svelte';
  import {
    ajusteHauteurScroll,
    calculeRectangleOuverture,
    degeleDefilementDuCorps,
    geleDefilementDuCorps,
  } from './visiteGuidee.utils';
  import type { EtapeVisiteGuideeAdditionnelle } from './visiteGuideeSPA.d';
  import AdminStatistiques from '../adminStatistiques/AdminStatistiques.svelte';
  import ListeMesures from '../listeMesures/ListeMesures.svelte';

  let { referentiel, featureFlags, nonce }: VisiteGuideeSPAProps = $props();

  let etapeAdditionnelle: EtapeVisiteGuideeAdditionnelle | undefined = $state();
  let modeAdditionnel = $derived(!!etapeAdditionnelle);

  onMount(() => {
    const requete = new URLSearchParams(window.location.search);
    etapeAdditionnelle =
      (requete.get('etapeAdditionnelle') as EtapeVisiteGuideeAdditionnelle) ||
      undefined;
    document
      .querySelector('body')
      ?.setAttribute('data-visite-guidee-v2-en-cours', 'true');
  });

  let etapeVisiteGuidee: EtapeVisiteGuidee = $state(1);
  let donneesEtape: DonneesEtapeVisiteGuidee = $derived(
    modeAdditionnel
      ? donneesEtapesVisiteGuideeAdditionnelle[etapeAdditionnelle!]
      : donneesEtapesVisiteGuidee[etapeVisiteGuidee]
  );
  let pageFondVisiteGuidee: PageFondVisiteGuidee = $derived(
    donneesEtape.pageFond
  );
  let rectCible: RectCible | undefined = $state();
  let elementModaleExplicative: HTMLElement | undefined = $state();
  const rideau = $state(document.getElementById('visite-guidee-rideau')!);
  const cadreBlanc = $state(
    document.getElementById('visite-guidee-cadre-blanc')!
  );

  let scrollGele = $state(0);

  $effect(() => {
    scrollGele = geleDefilementDuCorps();
    return () => {
      degeleDefilementDuCorps(scrollGele);
    };
  });

  const defilementActuel = $derived(
    document.body.style.position === 'fixed' ? scrollGele : window.scrollY
  );

  const recalculeDecoupe = async () => {
    rectCible = await calculeRectangleOuverture(
      donneesEtape,
      rideau,
      cadreBlanc
    );
  };

  const recalculeScroll = () => {
    scrollGele = ajusteHauteurScroll(
      donneesEtape.ouverture(),
      defilementActuel,
      scrollGele,
      elementModaleExplicative
        ? {
            element: elementModaleExplicative,
            position: donneesEtape.positionModale,
            decalage: donneesEtape.decalageModale || 0,
          }
        : undefined
    );
  };

  const positionneOuverture = async () => {
    recalculeScroll();
    await recalculeDecoupe();
  };

  $effect(() => {
    (async () => {
      await donneesEtape.callbackAvantOuverture?.();
      await tick();
      await positionneOuverture();
    })();
  });
</script>

<svelte:window onresize={positionneOuverture} />

<ModaleExplicative
  bind:etape={etapeVisiteGuidee}
  bind:elementModale={elementModaleExplicative}
  {rectCible}
  {modeAdditionnel}
  {donneesEtape}
/>

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
        aDejaVuEntierementVisiteGuidee={false}
      />
    </div>
  {:else if pageFondVisiteGuidee === 'statistiques'}
    <div class="avec-padding">
      <AdminStatistiques modeVisiteGuidee={true} {referentiel} />
    </div>
  {:else if pageFondVisiteGuidee === 'liste-mesures'}
    <lab-anssi-bandeau-titre
      titre="Liste de mesures"
      description="Retrouvez ici le référentiel de l'ANSSI et de la CNIL regroupant l’ensemble des mesures de sécurité. L’ajout de mesures spécifiques est limité à 40 pour favoriser une mise en œuvre efficace. "
    >
    </lab-anssi-bandeau-titre>
    <div class="contenu-centre">
      <ListeMesures
        capaciteAjoutDeMesure={{ nombreMaximum: 40 }}
        modeVisiteGuidee={true}
        statuts={referentiel.mesures.statuts}
        categories={Object.entries(referentiel.mesures.categories).map(
          ([cle, valeur]) => ({ id: cle, label: valeur as string })
        )}
        typesService={referentiel.typesService}
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

  .contenu-centre {
    width: 100%;
    max-width: 1200px;
    margin: 32px auto;
  }

  :global(body[data-visite-guidee-v2-en-cours] #tiroir) {
    transition: none;
  }

  :global(body[data-visite-guidee-v2-en-cours] lab-anssi-centre-aide) {
    display: none;
  }
</style>
