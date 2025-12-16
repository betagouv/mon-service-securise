<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let ciblePremiereMesure: HTMLDivElement;
  let cibleOnglets: HTMLDivElement;
  let cibleGererContributeurs: HTMLElement;
  let cibleTiroirMesure: HTMLDivElement;
  let cibleIndiceCyber: HTMLDivElement;
  onMount(() => {
    document.body.dispatchEvent(
      new CustomEvent('jquery-replie-menu-navigation-visite-guidee')
    );
    ciblePremiereMesure = document.getElementsByClassName(
      'titre-mesure'
    )[0]! as HTMLDivElement;
    cibleOnglets = document.getElementsByClassName(
      'conteneur-onglet'
    )[0]! as HTMLDivElement;
    cibleGererContributeurs = document.getElementById('gerer-contributeurs')!;
    cibleTiroirMesure = document.getElementsByClassName(
      'tiroir'
    )[0]! as HTMLDivElement;
    cibleIndiceCyber = document.getElementsByClassName(
      'conteneur-indice-cyber'
    )[0]! as HTMLDivElement;
  });
</script>

{#if ciblePremiereMesure && cibleOnglets && cibleGererContributeurs && cibleTiroirMesure && cibleIndiceCyber}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: ciblePremiereMesure,
        callbackInitialeCible: async (cible) => {
          const ligneMesure = cible.parentElement;
          if (ligneMesure) ligneMesure.inert = true;
          document.body.dispatchEvent(
            new CustomEvent('jquery-replie-menu-navigation-visite-guidee')
          );
        },
        delaiAvantAffichage: 200,
        positionnementModale: 'BasDroite',
        titre: 'Sécurisez, grâce à des mesures adaptées',
        description:
          'Chaque mesure est associée à son référentiel (ANSSI, CNIL) et son niveau d’importance (recommandée ou indispensable pour les mesures ANSSI).',
        animation: '/statique/assets/images/visiteGuidee/securiser_1.gif',
      },
      {
        cible: cibleOnglets,
        callbackInitialeCible: async (cible) => {
          const onglets = cible.querySelectorAll('button.onglet');
          for (let i = 0; i < onglets.length; i++) {
            onglets[i].inert = true;
          }
          document.body.dispatchEvent(
            new CustomEvent('jquery-replie-menu-navigation-visite-guidee')
          );
        },
        positionnementModale: 'MilieuDroite',
        titre: 'Définissez un statut pour chaque mesure !',
        description:
          'En fonction du statut défini, les mesures sont catégorisées par onglets afin de faciliter le suivi de celles qui vous restent à faire.',
        animation: '/statique/assets/images/visiteGuidee/securiser_2.gif',
        delaiAvantAffichage: 300,
      },
      {
        cible: cibleGererContributeurs,
        callbackInitialeCible: async (cible) => {
          cible.inert = true;
          document.getElementsByClassName(
            'inviter-contributeurs'
          )[0].style.display = 'flex';
          document.body.dispatchEvent(
            new CustomEvent('jquery-affiche-tiroir-contributeurs-visite-guidee')
          );
          document.getElementsByClassName('tiroir')[0].style.zIndex = '10001';
        },
        callbackFinaleCible: async () => {
          document
            .getElementsByClassName('fermeture-tiroir')[0]
            .dispatchEvent(new Event('click'));
          document.getElementsByClassName('tiroir')[0].style.zIndex = '1001';
        },
        positionnementModale: 'HautDroite',
        titre: 'Collaborez avec votre équipe',
        description:
          'Vous pouvez travailler en équipe, inviter vos collègues mais également vos prestataires. Différents niveaux de droits sont disponibles (lecture, édition…).',
        animation: '/statique/assets/images/visiteGuidee/contributeurs.gif',
        margeElementMisEnAvant: 3,
      },
      {
        cible: cibleTiroirMesure,
        callbackInitialeCible: async () => {
          document
            .getElementsByClassName('titre-mesure')[0]
            .dispatchEvent(new Event('click'));
          document.querySelector(
            '#conteneur-mesure .conteneur-actions button'
          ).disabled = true;
          document.getElementsByClassName(
            'fermeture-tiroir'
          )[0].disabled = true;
          const onglets = document.querySelectorAll(
            '#conteneur-mesure .conteneur-onglet .onglet'
          );
          for (let i = 0; i < onglets.length; i++) {
            onglets[i].inert = true;
          }
          setTimeout(() => {
            const ongletPlanAction = document.querySelector(
              '#conteneur-mesure .conteneur-onglet .onglet:nth-of-type(2)'
            );
            ongletPlanAction.dispatchEvent(new Event('click'));
          }, 300);
        },
        delaiAvantAffichage: 300,
        callbackFinaleCible: async () => {
          document
            .getElementsByClassName('fermeture-tiroir')[0]
            .dispatchEvent(new Event('click'));
        },
        positionnementModale: 'MilieuGauche',
        titre: "Définissez votre plan d'action cyber !",
        description:
          'Fixez des priorités, des échéances, et attribuez les différentes mesures aux contributeurs du projet',
        animation: '/statique/assets/images/visiteGuidee/securiser_3.gif',
      },
      {
        cible: cibleTiroirMesure,
        callbackInitialeCible: async () => {
          document
            .getElementsByClassName('titre-mesure')[0]
            .dispatchEvent(new Event('click'));
          document.querySelector(
            '#conteneur-mesure .conteneur-actions button'
          ).disabled = true;
          document.getElementsByClassName(
            'fermeture-tiroir'
          )[0].disabled = true;
          const onglets = document.querySelectorAll(
            '#conteneur-mesure .conteneur-onglet .onglet'
          );
          for (let i = 0; i < onglets.length; i++) {
            onglets[i].inert = true;
          }
          setTimeout(() => {
            const ongletActivites = document.querySelector(
              '#conteneur-mesure .conteneur-onglet .onglet:nth-of-type(3)'
            );
            ongletActivites.dispatchEvent(new Event('click'));
          }, 300);
        },
        delaiAvantAffichage: 300,
        callbackFinaleCible: async () => {
          document
            .getElementsByClassName('fermeture-tiroir')[0]
            .dispatchEvent(new Event('click'));
        },
        positionnementModale: 'MilieuGauche',
        titre: "Suivez tout ce qu'il se passe sur les mesures !",
        description:
          'Visualisez ce que vous et votre équipe faites sur vos mesures, notamment quel contributeur a fait des modifications et à quelle date.',
        animation:
          '/statique/assets/images/visiteGuidee/securiser_activites.gif',
      },
      {
        cible: cibleIndiceCyber,
        callbackInitialeCible: async (cible) => cible.removeAttribute('href'),
        margeElementMisEnAvant: 3,
        positionnementModale: 'MilieuGauche',
        titre: "Améliorez l'indice cyber de votre service",
        description:
          'Mettez en œuvre les mesures proposées et obtenez une évaluation indicative du niveau de sécurisation de votre service.',
        animation: '/statique/assets/images/visiteGuidee/indice_cyber.gif',
      },
    ]}
  />
{/if}
