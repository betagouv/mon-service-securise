<script lang="ts">
  import PagesService from '../pagesService/PagesService.svelte';
  import type {
    DonneesEtapeVisiteGuidee,
    EtapeVisiteGuidee,
    PageFondVisiteGuidee,
    VisiteGuideeSPAProps,
  } from './visiteGuideeSPA.d';
  import AssistantServiceV2 from '../creationV2/AssistantServiceV2.svelte';
  import TableauDeBord from '../tableauDeBord/TableauDeBord.svelte';
  import CreationV2 from '../creationV2/CreationV2.svelte';
  import ModaleExplicative from './ModaleExplicative.svelte';
  import { donneesEtapesVisiteGuidee } from './visiteGuideeSPA.donnees';
  import { tick } from 'svelte';

  let { referentiel, featureFlags, nonce }: VisiteGuideeSPAProps = $props();
  let etapeVisiteGuidee: EtapeVisiteGuidee = $state(1);
  let donneesEtape: DonneesEtapeVisiteGuidee = $derived(
    donneesEtapesVisiteGuidee[etapeVisiteGuidee]
  );
  let pageFondVisiteGuidee: PageFondVisiteGuidee = $derived(
    donneesEtape.pageFond
  );
  const rideau = $state(document.getElementById('visite-guidee-rideau')!);
  const cadreBlanc = $state(
    document.getElementById('visite-guidee-cadre-blanc')!
  );

  const decoupeParDefaut = { marge: 24, rayon: 8 };

  let scrollGele = 0;

  const geleDefilementDuCorps = () => {
    scrollGele = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollGele}px`;
    document.body.style.width = '100%';
  };

  const degeleDefilementDuCorps = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo({ top: scrollGele, behavior: 'instant' });
  };

  $effect(() => {
    geleDefilementDuCorps();
    return () => {
      degeleDefilementDuCorps();
    };
  });

  const defilementActuel = () =>
    document.body.style.position === 'fixed' ? scrollGele : window.scrollY;

  const estEntierementVisible = (element: HTMLElement) => {
    const { top, bottom } = element.getBoundingClientRect();
    return top >= 0 && bottom <= window.innerHeight;
  };

  const seraitEntierementVisibleEnHautDePage = (element: HTMLElement) => {
    const { top, height } = element.getBoundingClientRect();
    const topDepuisHautDocument = top + defilementActuel();
    return (
      topDepuisHautDocument >= 0 &&
      topDepuisHautDocument + height <= window.innerHeight
    );
  };

  const attendStabiliteDefilement = (essaisRestants = 120): Promise<void> =>
    new Promise((resolve) => {
      const precedent = window.scrollY;
      requestAnimationFrame(() => {
        const actuel = window.scrollY;
        if (actuel === precedent || essaisRestants <= 0) {
          resolve();
        } else {
          resolve(attendStabiliteDefilement(essaisRestants - 1));
        }
      });
    });

  const attendFinDuScroll = async (declencheScroll: () => void) => {
    declencheScroll();
    await attendStabiliteDefilement();
  };

  const scrolleSansBloquerLeCorps = async (declencheScroll: () => void) => {
    degeleDefilementDuCorps();
    await attendFinDuScroll(declencheScroll);
    geleDefilementDuCorps();
  };

  const cheminRectangleArrondi = (
    x: number,
    y: number,
    largeur: number,
    hauteur: number,
    rayon: number
  ) => {
    const r = Math.min(rayon, largeur / 2, hauteur / 2);
    return (
      `M${x + r} ${y} ` +
      `H${x + largeur - r} ` +
      `A${r} ${r} 0 0 1 ${x + largeur} ${y + r} ` +
      `V${y + hauteur - r} ` +
      `A${r} ${r} 0 0 1 ${x + largeur - r} ${y + hauteur} ` +
      `H${x + r} ` +
      `A${r} ${r} 0 0 1 ${x} ${y + hauteur - r} ` +
      `V${y + r} ` +
      `A${r} ${r} 0 0 1 ${x + r} ${y} ` +
      `Z`
    );
  };

  const calculeDecoupe = (
    ouverture: HTMLElement,
    { marge, rayon } = decoupeParDefaut
  ) => {
    const { left, top, right, bottom } = ouverture.getBoundingClientRect();
    const cheminElement = cheminRectangleArrondi(
      left,
      top,
      right - left,
      bottom - top,
      0
    );
    const cheminMarge = cheminRectangleArrondi(
      left - marge,
      top - marge,
      right - left + marge * 2,
      bottom - top + marge * 2,
      rayon
    );

    rideau.style.clipPath = `path(evenodd, "M0 0 H${window.innerWidth} V${window.innerHeight} H0 Z ${cheminMarge}")`;
    cadreBlanc.style.clipPath = `path(evenodd, "${cheminMarge} ${cheminElement}")`;
  };

  const rectEgaux = (a: DOMRect, b: DOMRect) =>
    a.top === b.top &&
    a.left === b.left &&
    a.right === b.right &&
    a.bottom === b.bottom;

  const attendStabiliteRect = (
    element: HTMLElement,
    essaisRestants = 60
  ): Promise<void> =>
    new Promise((resolve) => {
      const precedent = element.getBoundingClientRect();
      requestAnimationFrame(() => {
        const actuel = element.getBoundingClientRect();
        if (rectEgaux(precedent, actuel) || essaisRestants <= 0) {
          resolve();
        } else {
          resolve(attendStabiliteRect(element, essaisRestants - 1));
        }
      });
    });

  const desactiveTransition = (element: HTMLElement) => {
    const transitionOriginale = element.style.transition;
    element.style.transition = 'none';
    element.getBoundingClientRect();
    return () => {
      element.style.transition = transitionOriginale;
    };
  };

  $effect(() => {
    (async () => {
      await donneesEtape.callbackAvantOuverture?.();
      await tick();
      const ouverture = donneesEtape.ouverture();
      if (seraitEntierementVisibleEnHautDePage(ouverture)) {
        if (defilementActuel() !== 0) {
          await scrolleSansBloquerLeCorps(() =>
            window.scrollTo({ top: 0, behavior: 'smooth' })
          );
        }
      } else if (!estEntierementVisible(ouverture)) {
        await scrolleSansBloquerLeCorps(() =>
          ouverture.scrollIntoView({ behavior: 'smooth', block: 'center' })
        );
      }
      const restaureTransition = desactiveTransition(ouverture);
      await attendStabiliteRect(ouverture);
      calculeDecoupe(ouverture, donneesEtape.decoupe ?? decoupeParDefaut);
      restaureTransition();
    })();
  });
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

  :global(body[data-visite-guidee-en-cours] #tiroir) {
    transition: none;
  }
</style>
