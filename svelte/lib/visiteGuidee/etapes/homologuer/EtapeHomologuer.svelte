<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleNouvelleHomologation: HTMLElement;
  onMount(() => {
    cibleNouvelleHomologation = document.getElementById('suivant')!;
  });
</script>

{#if cibleNouvelleHomologation}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: cibleNouvelleHomologation,
        callbackInitialeCible: () => {},
        positionnementModale: 'HautDroite',
        titre: 'Mettez-vous en conformité',
        description:
          "Générez un dossier et un projet de décision d'homologation pour vous mettre en conformité avec la réglementation",
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
    ]}
  />
{/if}
