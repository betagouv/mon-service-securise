<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let ciblePremiereMesure: HTMLDivElement;
  let cibleOnglets: HTMLDivElement;
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
    cibleTiroirMesure = document.getElementsByClassName(
      'tiroir'
    )[0]! as HTMLDivElement;
    cibleIndiceCyber = document.getElementsByClassName(
      'conteneur-indice-cyber'
    )[0]! as HTMLDivElement;
  });
</script>

{#if ciblePremiereMesure && cibleOnglets && cibleTiroirMesure && cibleIndiceCyber}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: ciblePremiereMesure,
        callbackInitialeCible: (cible) => {
          const ligneMesure = cible.parentElement;
          if (ligneMesure) ligneMesure.inert = true;
        },
        delaiAvantAffichage: 200,
        positionnementModale: 'MilieuDroite',
        titre: 'Sécurisez, grâce à des mesures adaptées',
        description:
          'Chaque mesure est associée à son référentiel (ANSSI, CNIL) et son niveau d’importance (recommandée ou indispensable pour les mesures ANSSI).',
        animation: '/statique/assets/images/visiteGuidee/securiser_1.gif',
      },
      {
        cible: cibleOnglets,
        callbackInitialeCible: (cible) => {
          const onglets = cible.querySelectorAll('button.onglet');
          for (let i = 0; i < onglets.length; i++) {
            onglets[i].inert = true;
          }
        },
        positionnementModale: 'HautDroite',
        titre: 'Définissez un statut pour chaque mesure !',
        description:
          'En fonction du statut défini, les mesures sont catégorisées par onglets afin de faciliter le suivi de celles qui vous restent à faire.',
        animation: '/statique/assets/images/visiteGuidee/securiser_2.gif',
      },
      {
        cible: cibleTiroirMesure,
        callbackInitialeCible: () => {
          document
            .getElementsByClassName('ligne-de-mesure')[0]
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
        callbackFinaleCible: () => {
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
        cible: cibleIndiceCyber,
        callbackInitialeCible: (cible) => cible.removeAttribute('href'),
        margeElementMisEnAvant: 3,
        positionnementModale: 'HautGauche',
        titre: "Améliorez l'indice cyber de votre service",
        description:
          'Mettez en œuvre les mesures proposées et obtenez une évaluation indicative du niveau de sécurisation de votre service.',
        animation: '/statique/assets/images/visiteGuidee/indice_cyber.gif',
      },
    ]}
  />
{/if}
