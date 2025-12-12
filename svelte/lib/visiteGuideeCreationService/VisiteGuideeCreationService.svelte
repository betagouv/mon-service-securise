<script lang="ts">
  import AssistantServiceV2 from '../creationV2/AssistantServiceV2.svelte';
  import { leBrouillon } from '../creationV2/etapes/brouillon.store';

  leBrouillon.chargeDonnees({
    nomService: 'SuperService - Site internet',
  });
</script>

<AssistantServiceV2
  titreAssistant="Ajouter un service"
  titreBoutonFinalise="Commencer à sécuriser le service"
  enCoursDeChargement={false}
/>
