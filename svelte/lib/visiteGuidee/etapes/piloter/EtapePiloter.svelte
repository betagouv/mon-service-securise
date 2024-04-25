<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleNomService: HTMLElement;
  let cibleBandeauNouveaute: HTMLElement;
  onMount(() => {
    const intervalle = setInterval(() => {
      cibleNomService = document.getElementsByClassName(
        'cellule-noms'
      )[0]! as HTMLElement;
      if (cibleNomService) clearInterval(intervalle);
    }, 10);

    cibleBandeauNouveaute = document.getElementsByClassName(
      'bandeau-nouveautes'
    )[0]! as HTMLElement;
  });
</script>

{#if cibleNomService && cibleBandeauNouveaute}
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
      {
        cible: cibleBandeauNouveaute,
        positionnementModale: 'BasMilieu',
        avecTrouRideauColle: true,
        callbackInitialeCible: (cible) => {
          cible.disabled = true;
        },
        titre: 'Les nouveautés',
        description:
          'Ne ratez aucune évolution de MonServiceSécurisé. Nous vous partageons les nouveautés en matière de cybersécurité, et les mesures additionnelles qui peuvent impliquer des changement et/ou amélioration pour vos services.',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
    ]}
  />
{/if}
