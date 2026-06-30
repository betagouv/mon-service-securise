<script lang="ts">
  import { fade } from 'svelte/transition';
  import type {
    PagesServiceProps,
    ServiceComplet,
    ServicePourPagesService,
  } from './pagesService.d';
  import EntetePageService from '../entetePageService/EntetePageService.svelte';
  import { onMount } from 'svelte';
  import MenuNavigationService from '../menuNavigationService/MenuNavigationService.svelte';
  import { metadonneesPages } from './pages.donnees';
  import { routeurStore } from './store/routeur.store';
  import type { DescriptionServiceV2API } from '../decrireV2/decrireV2.d';
  import type { ContactsUtiles } from './pages/contactsUtiles/contactsUtiles.types';
  import Toaster from '../ui/Toaster.svelte';
  import BandeauReferentielV2 from '../bandeauReferentielV2/BandeauReferentielV2.svelte';
  import type { IndicesCyber } from './pages/indiceCyber/indiceCyber.types';
  import type { DossiersHomologation } from './pages/homologuer/homologuer.types';
  import { pageCourante } from './store/pageCourante.store';
  import { propsPourPage } from './PagesService.props';
  import { afficheTitrePageServiceStore } from './store/afficheTitrePageService.store';
  import { donneesVisiteGuidee } from './donneesVisiteGuidees';
  import type { RisquesV1 } from '../risquesV2/risquesV2.d';
  import { VersionService } from '../../../src/modeles/versionService';

  let props: PagesServiceProps = $props();

  let service: ServicePourPagesService | undefined = $state();
  let descriptionService: DescriptionServiceV2API | undefined = $state();
  let risquesV1: RisquesV1 | undefined = $state();
  let contactsUtiles: ContactsUtiles | undefined = $state();
  let indicesCyber: IndicesCyber | undefined = $state();
  let dossiers: DossiersHomologation | undefined = $state();
  let serviceCompletCharge = $state(false);

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
    if (props.modeVisiteGuidee) {
      service = donneesVisiteGuidee.service;
    } else {
      service = (
        await axios.get<ServicePourPagesService>(
          `/api/service/${props.idService}`
        )
      ).data;
    }
  };

  const rafraichisServiceComplet = async () => {
    let serviceComplet: ServiceComplet;
    if (props.modeVisiteGuidee) {
      serviceComplet = donneesVisiteGuidee.serviceComplet;
    } else {
      serviceComplet = (
        await axios.get<ServiceComplet>(
          `/api/service/${props.idService}?complet=true`
        )
      ).data;
    }

    descriptionService = serviceComplet.descriptionService;
    risquesV1 = serviceComplet.risques;
    contactsUtiles = serviceComplet.contactsUtiles;
    indicesCyber = serviceComplet.indicesCyber;
    dossiers = serviceComplet.dossiers;
    serviceCompletCharge = true;
  };

  onMount(async () => {
    await rafraichisResumeService();
    routeurStore.chargeInformationsService({
      visible: props.visible,
      version: service!.version,
      modeVisiteGuidee: props.modeVisiteGuidee,
    });
    await rafraichisServiceComplet();
  });

  let propsDuComposant = $derived.by(() =>
    propsPourPage(
      $pageCourante,
      props,
      service,
      descriptionService,
      risquesV1,
      contactsUtiles,
      indicesCyber,
      dossiers
    )
  );
</script>

<svelte:body on:mesure-modifiee={rafraichisServiceComplet} />
<svelte:document
  onclick={interecepteNavigation}
  on:description-service-modifiee={() => {
    rafraichisResumeService();
    rafraichisServiceComplet();
  }}
  on:contacts-utiles-service-modifiee={rafraichisServiceComplet}
  on:homologation-supprimee={rafraichisServiceComplet}
  on:homologation-modifiee={rafraichisServiceComplet}
  on:parcours-homologation-initie={rafraichisServiceComplet}
  on:homologation-finalisee={rafraichisServiceComplet}
/>

<Toaster />
{#if service && serviceCompletCharge}
  <div class="conteneur-pages-service">
    {#if service.version === 'v1'}
      <BandeauReferentielV2 idService={props.idService} />
    {/if}
    <EntetePageService
      idService={props.idService}
      nomService={service.nomService}
      indiceCyber={indicesCyber?.indiceCyberAnssi?.total ?? 0}
      indiceCyberPersonnalise={indicesCyber?.indiceCyberPersonnalise?.total ??
        0}
      noteMax={props.referentiel.indiceCyber.noteMax}
      organisationResponsable={service.organisationResponsable}
      avecIndiceCyber={props.visible.indiceCyber}
    />
    <div class="contenu-page">
      <MenuNavigationService
        idService={props.idService}
        visible={props.visible}
        modeVisiteGuidee={props.modeVisiteGuidee}
        etapeActive={$pageCourante}
      />
      <div class="conteneur-page">
        {#key $routeurStore.location}
          {@const donneesPage = metadonneesPages[$pageCourante]}
          {@const Composant = donneesPage?.composant}
          {#if $afficheTitrePageServiceStore}
            <h1>
              <span>{donneesPage?.titre}</span>
              {#if props.featureFlags.avecRisquesV2 && $pageCourante === 'risques' && service.version === VersionService.v2}
                <dsfr-badge
                  label="BÊTA"
                  type="accent"
                  accent="blue-cumulus"
                  size="sm"
                ></dsfr-badge>
              {/if}
            </h1>
            <h2>{donneesPage?.sousTitre}</h2>
          {/if}
          <div class="conteneur-composant-page" in:fade={{ duration: 150 }}>
            <Composant
              idService={props.idService}
              visible={props.visible}
              modeVisiteGuidee={props.modeVisiteGuidee}
              {...propsDuComposant}
            />
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
        position: relative;
        display: flex;
        flex-direction: column;
        flex-grow: 1;

        h1 {
          font-size: 1.75rem;
          line-height: 2.25rem;
          font-weight: bold;
          text-align: left;
          margin: 0 0 8px 0;
          display: flex;
          gap: 12px;
          align-items: flex-end;
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
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
      }
    }
  }
</style>
