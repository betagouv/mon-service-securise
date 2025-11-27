<script lang="ts">
  import AssistantServiceV2 from './AssistantServiceV2.svelte';
  import type { Entite } from '../ui/types';
  import type { UUID } from '../typesBasiquesSvelte';
  import {
    creeBrouillonService,
    finaliseBrouillonService,
    lisBrouillonService,
    metsAJourBrouillonService,
    type MiseAJour,
  } from './creationV2.api';
  import { entiteDeUtilisateur, leBrouillon } from './etapes/brouillon.store';
  import { navigationStore } from './etapes/navigation.store';
  import { onMount, tick } from 'svelte';
  import { ajouteParametreAUrl } from '../outils/url';
  import type { BrouillonServiceV2 } from './creationV2.types';
  import { etapeCourante } from './etapes/etapeCourante.store';
  import { toasterStore } from '../ui/stores/toaster.store';

  export let entite: Entite | undefined;
  let enCoursDeChargement = false;

  onMount(async () => {
    const requete = new URLSearchParams(window.location.search);
    if (requete.has('id')) {
      const idBrouillon = requete.get('id') as UUID;
      const donneesBrouillon = await lisBrouillonService(idBrouillon);
      leBrouillon.chargeDonnees(donneesBrouillon);
      navigationStore.reprendreEditionDe($leBrouillon, false);
    } else {
      navigationStore.changeModeEdition(false);
    }
    if (entite) $entiteDeUtilisateur = entite;
  });

  const metsAJourPropriete = async (e: CustomEvent<MiseAJour>) => {
    const doitCreerBrouillon =
      !$leBrouillon.id && $etapeCourante.estPremiereQuestion;
    if (doitCreerBrouillon) {
      const nomService = e.detail.nomService as string;
      const idBrouillon = await creeBrouillonService(nomService);
      ajouteParametreAUrl('id', idBrouillon);
      leBrouillon.chargeDonnees({ id: idBrouillon, nomService });
      return;
    }

    await metsAJourBrouillonService($leBrouillon.id!, e.detail);

    const nomChampModifie = Object.keys(
      e.detail
    )[0] as keyof BrouillonServiceV2;
    const onEstToujoursSurLaQuestionQuiAEnvoyeLaMaj =
      $etapeCourante.questionCourante.clesPropriete.includes(nomChampModifie);
    // si on n'est plus sur la question mise à jour, c'est que "suivant()" a déjà été appelé
    if (
      onEstToujoursSurLaQuestionQuiAEnvoyeLaMaj &&
      $etapeCourante.questionCourante.avecAvanceRapide
    )
      navigationStore.suivant();
  };

  const finalise = async () => {
    enCoursDeChargement = true;
    try {
      const idService = await finaliseBrouillonService($leBrouillon.id!);
      window.location.href = `/service/${idService}/mesures`;
    } catch (e) {
      if (
        e.response?.status === 422 &&
        e.response?.data?.erreur?.code === 'NOM_SERVICE_DEJA_EXISTANT'
      ) {
        navigationStore.retourneEtapeNomService();
        toasterStore.erreur(
          'Erreur lors de la création du service',
          `Le nom de service ${$leBrouillon.nomService} est déjà utilisé. Veuillez choisir un autre nom de service.`
        );
        await tick();
        setTimeout(() => {
          const elementRacine: HTMLElement & {
            status: string;
            errorMessage: string;
          } = document.querySelector("dsfr-input[nom='nom-service']")!;
          elementRacine.status = 'error';
          elementRacine.errorMessage = 'Ce nom de service est déjà utilisé.';
          const element: HTMLInputElement =
            elementRacine.shadowRoot?.getElementById(
              'nom-service'
            ) as HTMLInputElement;
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    } finally {
      enCoursDeChargement = false;
    }
  };
</script>

<AssistantServiceV2
  on:champModifie={metsAJourPropriete}
  on:finalise={finalise}
  bind:enCoursDeChargement
  titreAssistant="Ajouter un service"
  titreBoutonFinalise="Commencer à sécuriser le service"
/>
