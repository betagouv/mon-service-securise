<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';

  const cibleNomService = document.getElementById('nom-service')!;
  const cibleGererContributeurs = document.getElementById(
    'gerer-contributeurs'
  )!;
</script>

<ModaleSousEtape
  sousEtapes={[
    {
      cible: cibleNomService,
      callbackInitialeCible: (cible) => (cible.style.width = '50%'),
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
        document.getElementsByClassName(
          'nombre-contributeurs'
        )[0].style.display = 'none';
        document.body.dispatchEvent(
          new CustomEvent('jquery-affiche-tiroir-contributeurs-visite-guidee')
        );
        document.getElementsByClassName('tiroir')[0].style.zIndex = '10001';
      },
      positionnementModale: 'HautDroite',
      titre: 'Collaborez avec votre équipe',
      description:
        'Vous pouvez travailler en équipe, inviter vos collègues mais également vos prestataires. Différents niveaux de droits sont disponibles (lecture, édition…).',
      animation: '/statique/assets/images/visiteGuidee/decrire.gif',
    },
  ]}
/>
