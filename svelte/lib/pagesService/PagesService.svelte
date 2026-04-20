<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { PagesServiceProps } from './pagesService.d';
  import EntetePageService from '../entetePageService/EntetePageService.svelte';
  import { onMount } from 'svelte';
  import MenuNavigationService from '../menuNavigationService/MenuNavigationService.svelte';
  import { metadonneesPages } from './pages.donnees';
  import type { VersionService } from '../../../src/modeles/versionService';
  import { pageCourante, routeurStore } from './store/routeur.store';
  import type { DescriptionServiceV2API } from '../decrireV2/decrireV2.d';
  import { tousRisques } from '../risques/risques';
  import type { Risques } from '../risques/risques.d';
  import type { ContactsUtiles } from './pages/contactsUtiles/contactsUtiles.types';
  import Toaster from '../ui/Toaster.svelte';
  import BandeauReferentielV2 from '../bandeauReferentielV2/BandeauReferentielV2.svelte';
  import type { IndicesCyber } from './pages/indiceCyber/indiceCyber.types';

  let {
    idService,
    referentiel,
    modeVisiteGuidee,
    visible,
    estLectureSeule,
    featureFlags,
    preferencesUtilisateur,
    suggestionsService,
  }: PagesServiceProps = $props();

  type ServicePourPagesService = {
    id: string;
    nomService: string;
    organisationResponsable: string;
    version: VersionService;
  };

  let service: ServicePourPagesService | undefined = $state();
  let descriptionService: DescriptionServiceV2API | undefined = $state();
  let risques: ReturnType<typeof tousRisques> | undefined = $state();
  let contactsUtiles: ContactsUtiles | undefined = $state();
  let indicesCyber: IndicesCyber | undefined = $state();

  const interecepteNavigation = (e: MouseEvent) => {
    const link = (e.target as Element).closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    if (
      link.origin !== window.location.origin ||
      link.hasAttribute('data-external') ||
      href.startsWith('#') ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;

    e.preventDefault();
    routeurStore.navigue(href);
  };

  const rafraichisResumeService = async () => {
    service = (
      await axios.get<ServicePourPagesService>(`/api/service/${idService}`)
    ).data;
  };

  const rafraichisServiceComplet = async () => {
    const serviceComplet = (
      await axios.get<{
        descriptionService: DescriptionServiceV2API;
        risques: Risques;
        contactsUtiles: ContactsUtiles;
        indicesCyber: IndicesCyber;
      }>(`/api/service/${idService}?complet=true`)
    ).data;

    descriptionService = serviceComplet.descriptionService;
    risques = tousRisques(serviceComplet.risques);
    contactsUtiles = serviceComplet.contactsUtiles;
    indicesCyber = serviceComplet.indicesCyber;
  };

  onMount(async () => {
    await rafraichisResumeService();
    routeurStore.chargeInformationsService({
      visible,
      version: service!.version,
    });
    await rafraichisServiceComplet();
  });

  let propsDuComposant = $derived.by(() => {
    switch ($pageCourante) {
      case 'mesures':
        return {
          estLectureSeule: estLectureSeule.mesures,
          categories: referentiel.mesures.categories,
          statuts: referentiel.mesures.statuts,
          priorites: referentiel.mesures.priorites,
          versionService: service?.version,
          avecRisquesV2: featureFlags.avecRisquesV2,
          afficheExplicationRisquesV2:
            preferencesUtilisateur.afficheExplicationRisquesV2,
        };
      case 'descriptionService':
        return {
          lectureSeule: estLectureSeule.descriptionService,
          descriptionService,
          doitFinaliserDescription:
            suggestionsService.finalisationDescriptionServiceImporte,
        };
      case 'risques':
        return {
          estLectureSeule: estLectureSeule.risques,
          categoriesRisque: referentiel.risques.categories,
          niveauxGravite: referentiel.risques.gravites,
          niveauxVraisemblance: referentiel.risques.vraisemblances,
          referentielRisques: referentiel.risques.descriptions,
          matriceNiveauxRisque: referentiel.risques.matrice,
          niveauxRisque: referentiel.risques.niveaux,
          risques,
        };
      case 'rolesResponsabilites':
        return {
          contactsUtiles,
        };
      case 'indiceCyber':
        return {
          indiceCyber: indicesCyber?.indiceCyberAnssi,
          indiceCyberPersonnalise: indicesCyber?.indiceCyberPersonnalise,
          noteMax: referentiel.indiceCyber.noteMax,
          referentielsMesureConcernes:
            indicesCyber?.referentielsMesureConcernes,
          nombreMesuresSpecifiques: indicesCyber?.nombreMesuresSpecifiques,
          nombreMesuresNonFait: indicesCyber?.nombreMesuresNonFait,
        };
      default:
        return {};
    }
  });
</script>

<svelte:document
  onclick={interecepteNavigation}
  on:description-service-modifiee={rafraichisResumeService}
  on:contacts-utiles-service-modifiee={rafraichisServiceComplet}
/>

<Toaster />
{#if service && descriptionService && indicesCyber && contactsUtiles}
  <div class="conteneur-pages-service">
    {#if service.version === 'v1'}
      <BandeauReferentielV2 {idService} />
    {/if}
    <EntetePageService
      {idService}
      nomService={service.nomService}
      indiceCyber={indicesCyber.indiceCyberAnssi?.total ?? 0}
      indiceCyberPersonnalise={indicesCyber.indiceCyberPersonnalise?.total ?? 0}
      noteMax={referentiel.indiceCyber.noteMax}
      organisationResponsable={service.organisationResponsable}
    />
    <div class="contenu-page">
      <MenuNavigationService
        {idService}
        {visible}
        {modeVisiteGuidee}
        etapeActive={$pageCourante}
      />
      <div class="conteneur-page">
        {#key $routeurStore.location}
          {@const donneesPage = metadonneesPages[$pageCourante]}
          {@const Composant = donneesPage?.composant}
          <h1>{donneesPage?.titre}</h1>
          <h2>{donneesPage?.sousTitre}</h2>
          <div class="conteneur-composant-page" in:fade={{ duration: 150 }}>
            <Composant {idService} {...propsDuComposant} />
          </div>
        {/key}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .conteneur-pages-service {
    display: flex;
    flex-direction: column;
    height: 100%;

    .contenu-page {
      display: flex;
      align-items: stretch;
      flex-grow: 1;

      .conteneur-page {
        padding: 32px 24px 0 72px;
        color: #161616;
        margin-bottom: 24px;
        width: 100%;

        h1 {
          font-size: 1.75rem;
          line-height: 2.25rem;
          font-weight: bold;
          text-align: left;
          margin: 0 0 8px 0;
        }

        h2 {
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: normal;
          text-align: left;
          margin: 12px 0 0 0;
          max-width: 750px;
        }

        .conteneur-composant-page {
          padding-top: 24px;
        }
      }
    }
  }
</style>
