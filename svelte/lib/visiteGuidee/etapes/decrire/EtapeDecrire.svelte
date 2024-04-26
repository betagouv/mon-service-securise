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
          'Dans un premier temps, répondez à quelques questions afin d’obtenir une liste de mesures de sécurité personnalisée',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
      {
        cible: cibleGererContributeurs,
        callbackInitialeCible: (cible) => {
          cible.style.minWidth = '204px';
          document.getElementsByClassName(
            'inviter-contributeurs'
          )[0].style.display = 'flex';
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
      },
    ]}
  />
{/if}
