<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';
  import { visiteGuidee } from '../../visiteGuidee.store';

  let cibleNomService: HTMLElement;
  let cibleBandeauNouveaute: HTMLElement;
  let cibleBOM: HTMLElement;
  let cibleNouveauService: HTMLElement;
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
    cibleBOM = document.getElementsByClassName('bom-modale')[0]! as HTMLElement;
    cibleNouveauService = document.getElementsByClassName(
      'nouveau-service'
    )[0]! as HTMLElement;
  });
</script>

{#if cibleNomService && cibleBandeauNouveaute && cibleBOM && cibleNouveauService}
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
      {
        cible: cibleBOM,
        positionnementModale: 'BasGauche',
        avecTrouRideauColle: true,
        callbackInitialeCible: () => {
          document
            .getElementsByClassName('bom-titre')[0]
            .dispatchEvent(new Event('click'));
          document.querySelector('.bom-modale .fermeture').disabled = true;
          document
            .querySelectorAll('.bom-modale .contenu a')
            .forEach((lien) => lien.removeAttribute('href'));
        },
        callbackFinaleCible: () => {
          document
            .querySelector('.bom-modale .fermeture')
            .dispatchEvent(new Event('click'));
        },
        titre: 'MonServiceSécurisé vous accompagne',
        description:
          'Pour toute question, MonServiceSécurisé se fera un plaisir de vous aider par chat ou par webinaire. N’hésitez pas à nous faire vos retours sur le produit, nous les lirons avec attention.',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
      {
        cible: cibleNouveauService,
        positionnementModale: 'HautGauche',
        avecTrouRideauColle: true,
        callbackInitialeCible: (cible) => {
          cible.addEventListener('click', () => visiteGuidee.finalise());
        },
        titre: 'Créez votre premier service !',
        description:
          'N’attendez plus et commencez à sécuriser vos services numériques en créant votre premier service !',
        derniereEtape: true,
      },
    ]}
  />
{/if}
