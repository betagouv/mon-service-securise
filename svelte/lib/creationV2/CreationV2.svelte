<script lang="ts">
  import AssistantServiceV2 from './AssistantServiceV2.svelte';
  import type { Entite } from '../ui/types';
  import type { UUID } from '../typesBasiquesSvelte';
  import { lisBrouillonService } from './creationV2.api';
  import { entiteDeUtilisateur, leBrouillon } from './etapes/brouillon.store';
  import { navigationStore } from './etapes/navigation.store';
  import { onMount } from 'svelte';

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
</script>

<AssistantServiceV2 />
