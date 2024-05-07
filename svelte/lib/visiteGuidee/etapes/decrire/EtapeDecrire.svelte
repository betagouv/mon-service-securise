<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleNomService: HTMLElement;
  let cibleGererContributeurs: HTMLElement;
  onMount(() => {
    cibleNomService = document.getElementById('nom-service')!;
    cibleGererContributeurs = document.getElementById('gerer-contributeurs')!;
  });
</script>

{#if cibleNomService && cibleGererContributeurs}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: cibleNomService,
        callbackInitialeCible: (cible) => {
          cible.style.width = '50%';
          window.scrollTo(0, 0); // Ici on force le scroll pour ne pas être dérangé par "Erreur de saisie"
        },
        callbackFinaleCible: (cible) => (cible.style.width = '100%'),
        positionnementModale: 'MilieuDroite',
        titre: 'Décrivez votre service',
        description:
          'Dans un premier temps, renseignez quelques informations afin d’obtenir une liste personnalisée de mesures de sécurité.',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
        margeElementMisEnAvant: 28,
      },
      {
        cible: cibleGererContributeurs,
        callbackInitialeCible: (cible) => {
          cible.inert = true;
          document.getElementsByClassName(
            'inviter-contributeurs'
          )[0].style.display = 'flex';
          document.body.dispatchEvent(
            new CustomEvent('jquery-deplie-menu-navigation-visite-guidee')
          );
          document.body.dispatchEvent(
            new CustomEvent('jquery-affiche-tiroir-contributeurs-visite-guidee')
          );
          document.getElementsByClassName('tiroir')[0].style.zIndex = '10001';
        },
        callbackFinaleCible: () =>
          document
            .getElementsByClassName('fermeture-tiroir')[0]
            .dispatchEvent(new Event('click')),
        positionnementModale: 'HautDroite',
        titre: 'Collaborez avec votre équipe',
        description:
          'Vous pouvez travailler en équipe, inviter vos collègues mais également vos prestataires. Différents niveaux de droits sont disponibles (lecture, édition…).',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
        margeElementMisEnAvant: 3,
      },
    ]}
  />
{/if}
