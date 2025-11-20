<script lang="ts">
  import AssistantServiceV2 from './AssistantServiceV2.svelte';
  import type { Entite } from '../ui/types';
  import type { UUID } from '../typesBasiquesSvelte';
  import {
    creeBrouillonService,
    lisBrouillonService,
    metsAJourBrouillonService,
    type MiseAJour,
  } from './creationV2.api';
  import { entiteDeUtilisateur, leBrouillon } from './etapes/brouillon.store';
  import { navigationStore } from './etapes/navigation.store';
  import { onMount } from 'svelte';
  import { ajouteParametreAUrl } from '../outils/url';
  import type { BrouillonServiceV2 } from './creationV2.types';
  import { etapeCourante } from './etapes/etapeCourante.store';

  export let entite: Entite | undefined;

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
</script>

<AssistantServiceV2 on:champModifie={metsAJourPropriete} />
