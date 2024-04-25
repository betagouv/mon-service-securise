<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleNomService: HTMLElement;
  onMount(() => {
    const intervalle = setInterval(() => {
      cibleNomService = document.getElementsByClassName(
        'cellule-noms'
      )[0]! as HTMLElement;
      if (cibleNomService) clearInterval(intervalle);
    }, 10);
  });
</script>

{#if cibleNomService}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: cibleNomService,
        positionnementModale: 'MilieuDroite',
        avecTrouRideauColle: true,
        callbackInitialeCible: () => {
          document
            .getElementsByClassName('conteneur-noms')[0]
            .removeAttribute('href');
          document.getElementsByClassName(
            'selection-service'
          )[0].disabled = true;
        },
        titre: 'Votre tableau de bord',
        description:
          'Vous pourrez piloter en équipe la sécurité de tous vos services numériques et les homologuer rapidement, grâce à un tableau complet présentant vos données de progressions.',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
    ]}
  />
{/if}
