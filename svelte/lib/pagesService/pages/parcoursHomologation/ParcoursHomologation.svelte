<script lang="ts">
  import { onMount } from 'svelte';
  import * as api from './parcoursHomologation.api';
  import type {
    ComposantEtape,
    EtapeParcoursHomologation,
    IdEtapeParcoursHomologation,
    InstanceEtapeParcoursHomologation,
  } from './parcoursHomologation.types';
  import { etapeDeURL } from './routeurParcours';
  import EtapeAutorite from './etapes/EtapeAutorite.svelte';
  import type { Dossier } from '../homologuer/homologuer.types';
  import EtapeAvis from './etapes/EtapeAvis.svelte';
  import EtapeDocuments from './etapes/EtapeDocuments.svelte';
  import EtapeDateTelechargement from './etapes/EtapeDateTelechargement.svelte';
  import EtapeDecision from './etapes/EtapeDecision.svelte';
  import EtapeRecapitulatif from './etapes/EtapeRecapitulatif.svelte';
  import type {
    EcheancesRenouvellementHomologation,
    StatutsAvisDossierHomologation,
  } from '../../pagesService.d';
  import VoirDemarcheIndicative from './kit/VoirDemarcheIndicative.svelte';
  import type { IdNiveauDeSecurite } from '../../../ui/types';
  import { navigation } from './parcoursHomologation.navigation';
  import BoutonsActions from './BoutonsActions.svelte';
  import { afficheTitrePageServiceStore } from '../../store/afficheTitrePageService.store';

  interface Props {
    idService: string;
    dossier: Dossier;
    statutsAvisDossierHomologation: StatutsAvisDossierHomologation;
    etapesParcours: Array<EtapeParcoursHomologation>;
    echeancesRenouvellement: EcheancesRenouvellementHomologation;
    peutHomologuer: boolean;
    niveauSecurite: IdNiveauDeSecurite;
    estLectureSeule: boolean;
  }

  let {
    idService,
    dossier,
    etapesParcours,
    statutsAvisDossierHomologation,
    echeancesRenouvellement,
    peutHomologuer,
    niveauSecurite,
    estLectureSeule,
  }: Props = $props();

  let etapeCourante: IdEtapeParcoursHomologation | undefined = $state();
  let estDerniereEtape = $derived(etapeCourante === etapesParcours.at(-1)?.id);
  let detailsEtapeCourante: EtapeParcoursHomologation | undefined = $derived(
    etapesParcours.find((e) => e.id === etapeCourante)
  );
  let detailsEtapeSuivante = $derived(
    detailsEtapeCourante
      ? etapesParcours.find((e) => e.numero === detailsEtapeCourante.numero + 1)
      : undefined
  );
  let detailsEtapePrecedente = $derived(
    detailsEtapeCourante
      ? etapesParcours.find((e) => e.numero === detailsEtapeCourante.numero - 1)
      : undefined
  );

  onMount(async () => {
    etapeCourante = await api.reprendsParcours(
      idService,
      etapeDeURL(window.location.pathname)
    );
    document.dispatchEvent(new CustomEvent('parcours-homologation-initie'));
  });

  const suivant = async () => {
    if (!estLectureSeule) {
      try {
        await composantEtapeCourante?.enregistre();
      } catch {
        return;
      }
      document.dispatchEvent(new CustomEvent('homologation-modifiee'));
    }
    if (detailsEtapeSuivante) {
      navigation.versEtape(idService, detailsEtapeSuivante.id);
    }
  };

  const precedent = async () => {
    if (detailsEtapePrecedente) {
      navigation.versEtape(idService, detailsEtapePrecedente.id);
    }
  };

  const annuler = () => {
    navigation.versDossiers(idService);
  };

  const enregistrerDecision = async () => {
    const refuseeAvantRechargement = dossier.decision.refusee;
    await api.enregistrement(idService).finalise();
    document.dispatchEvent(new CustomEvent('homologation-finalisee'));
    navigation.versDossiersApresFinalisation(
      idService,
      !!refuseeAvantRechargement
    );
  };

  let composantEtapeCourante: InstanceEtapeParcoursHomologation | undefined =
    $state();

  const composants: Record<IdEtapeParcoursHomologation, ComposantEtape> = {
    autorite: EtapeAutorite,
    avis: EtapeAvis,
    documents: EtapeDocuments,
    dateTelechargement: EtapeDateTelechargement,
    decision: EtapeDecision,
    recapitulatif: EtapeRecapitulatif,
  };

  $effect(() => {
    $afficheTitrePageServiceStore = etapeCourante === 'autorite';
    return () => {
      $afficheTitrePageServiceStore = true;
    };
  });
</script>

{#if etapeCourante && dossier && detailsEtapeCourante}
  {@const Composant = composants[etapeCourante]}
  <dsfr-stepper
    title={detailsEtapeCourante.libelle}
    next-step={detailsEtapeSuivante?.libelle}
    step-count={etapesParcours.length}
    current-step={detailsEtapeCourante.numero}
    {...detailsEtapeSuivante === undefined ? { 'hide-details': true } : {}}
  >
  </dsfr-stepper>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      suivant();
    }}
  >
    <div class="etape-parcours">
      <hr />
      <Composant
        {idService}
        {dossier}
        {statutsAvisDossierHomologation}
        {echeancesRenouvellement}
        {peutHomologuer}
        {estLectureSeule}
        bind:this={composantEtapeCourante}
      />
    </div>
    <VoirDemarcheIndicative {etapeCourante} {niveauSecurite} />
    <BoutonsActions
      onannuler={annuler}
      onprecedent={precedent}
      onenregistrer={enregistrerDecision}
      estPremiereEtape={detailsEtapeCourante.numero === 1}
      {estDerniereEtape}
      {peutHomologuer}
    />
  </form>
{/if}

<style lang="scss">
  :root {
    --parcours-homologation-largeur-formulaire: 894px;
  }

  dsfr-stepper {
    width: calc(var(--parcours-homologation-largeur-formulaire) * 2 / 3);
  }

  form {
    flex-grow: 1;
  }

  .etape-parcours {
    width: var(--parcours-homologation-largeur-formulaire);
  }

  hr {
    border: none;
    border-top: 1px solid #dddddd;
    margin-bottom: 2rem;
  }
</style>
