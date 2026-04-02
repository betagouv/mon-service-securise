<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { PagesServiceProps } from './pagesService.d';
  import EntetePageService from '../entetePageService/EntetePageService.svelte';
  import { onMount } from 'svelte';
  import MenuNavigationService from '../menuNavigationService/MenuNavigationService.svelte';
  import { metadonneesPages } from './pages.donnees';
  import type { VersionService } from '../../../src/modeles/versionService';
  import { pageCourante, routeurStore } from './store/routeur.store';

  let {
    idService,
    referentiel,
    etapeActive,
    modeVisiteGuidee,
    visible,
    estLectureSeule,
    featureFlags,
    preferencesUtilisateur,
  }: PagesServiceProps = $props();

  type ServicePourPagesService = {
    id: string;
    nomService: string;
    organisationResponsable: string;
    version: VersionService;
  };
  type IndiceCyber = {
    total: number;
  };

  let service: ServicePourPagesService | undefined = $state();
  let indiceCyber: IndiceCyber | undefined = $state();
  let indiceCyberPersonnalise: IndiceCyber | undefined = $state();

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
      // Vérifier que c'est une route couverte par notre routeur, et qu'elle fait partie de "estVisible"
    )
      return;

    e.preventDefault();
    routeurStore.navigue(href);
  };

  onMount(async () => {
    service = (
      await axios.get<ServicePourPagesService>(`/api/service/${idService}`)
    ).data;
    indiceCyber = (
      await axios.get<IndiceCyber>(`/api/service/${idService}/indiceCyber`)
    ).data;
    indiceCyberPersonnalise = (
      await axios.get<IndiceCyber>(
        `/api/service/${idService}/indiceCyberPersonnalise`
      )
    ).data;
  });
</script>

<svelte:document onclick={interecepteNavigation} />
{#if service}
  <div class="conteneur-pages-service">
    <EntetePageService
      {idService}
      nomService={service.nomService}
      indiceCyber={indiceCyber?.total ?? 0}
      indiceCyberPersonnalise={indiceCyberPersonnalise?.total ?? 0}
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
            <Composant
              {idService}
              categories={referentiel.mesures.categories}
              statuts={referentiel.mesures.statuts}
              priorites={referentiel.mesures.priorites}
              estLectureSeule={estLectureSeule.mesures}
              {modeVisiteGuidee}
              versionService={service.version}
              avecRisquesV2={featureFlags.avecRisquesV2}
              afficheExplicationRisquesV2={preferencesUtilisateur.afficheExplicationRisquesV2}
            />
            <!--          <TableauDesMesures-->
            <!--            {idService}-->
            <!--            categories={referentiel.mesures.categories}-->
            <!--            statuts={referentiel.mesures.statuts}-->
            <!--            priorites={referentiel.mesures.priorites}-->
            <!--            estLectureSeule={estLectureSeule.mesures}-->
            <!--            {modeVisiteGuidee}-->
            <!--            versionService={service.version}-->
            <!--            avecRisquesV2={featureFlags.avecRisquesV2}-->
            <!--            afficheExplicationRisquesV2={preferencesUtilisateur.afficheExplicationRisquesV2}-->
            <!--          />-->
          </div>
        {/key}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  :global(.menu-navigation-service) {
    height: unset !important;
  }

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
