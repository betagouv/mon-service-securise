<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';
  import type { SousEtape } from '../../kit/ModaleSousEtape';
  import TiroirGestionContributeurs from '../../../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';

  let ciblePremiereMesure: HTMLDivElement | undefined = $state();
  let cibleOnglets: HTMLDivElement | undefined = $state();
  let cibleGererContributeurs: HTMLElement | undefined = $state();
  let cibleTiroirMesure: HTMLDivElement | undefined = $state();
  let cibleIndiceCyber: HTMLDivElement | undefined = $state();

  let sousEtapes: SousEtape[] = $state([]);
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

    sousEtapes = [
      {
        cible: ciblePremiereMesure,
        callbackInitialeCible: async (cible) => {
          if (!cible) return;

          const ligneMesure = cible.parentElement;
          if (ligneMesure) ligneMesure.inert = true;
        },
        positionnementModale: 'BasDroite',
        titre: 'Sécurisez, grâce à des mesures adaptées',
        description:
          'Chaque mesure est associée à son référentiel (ANSSI, CNIL) et son niveau d’importance (recommandée ou indispensable pour les mesures ANSSI).',
        animation: '/statique/assets/images/visiteGuidee/securiser_1.gif',
      },
      {
        cible: cibleOnglets,
        callbackInitialeCible: async (cible) => {
          if (!cible) return;

          const onglets =
            cible.querySelectorAll<HTMLDivElement>('button.onglet');
          for (let i = 0; i < onglets.length; i++) {
            onglets[i].inert = true;
          }
        },
        positionnementModale: 'MilieuDroite',
        titre: 'Définissez un statut pour chaque mesure !',
        description:
          'En fonction du statut défini, les mesures sont catégorisées par onglets afin de faciliter le suivi de celles qui vous restent à faire.',
        animation: '/statique/assets/images/visiteGuidee/securiser_2.gif',
      },
      {
        cible: cibleGererContributeurs,
        callbackInitialeCible: async () => {
          tiroirStore.afficheContenu(TiroirGestionContributeurs, {
            services: [],
            modeVisiteGuidee: true,
          });
          const tiroir =
            document.querySelectorAll<HTMLDivElement>('#tiroir')[0];
          tiroir.style.zIndex = '10001';
        },
        callbackFinaleCible: async () => {
          tiroirStore.ferme();
        },
        positionnementModale: 'MilieuDroite',
        titre: 'Collaborez avec votre équipe',
        description:
          'Vous pouvez travailler en équipe, inviter vos collègues mais également vos prestataires. Différents niveaux de droits sont disponibles (lecture, édition…).',
        animation: '/statique/assets/images/visiteGuidee/contributeurs.gif',
      },
      {
        cible: cibleTiroirMesure,
        callbackInitialeCible: async () => {
          document
            .getElementsByClassName('titre-mesure')[0]
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
          const bouton = document.querySelector<HTMLButtonElement>(
            '#conteneur-mesure .conteneur-actions button'
          );
          if (bouton) bouton.disabled = true;
          const boutonFermeture =
            document.querySelector<HTMLButtonElement>('.fermeture-tiroir');
          if (boutonFermeture) boutonFermeture.disabled = true;
          const onglets = document.querySelectorAll<HTMLDivElement>(
            '#conteneur-mesure .conteneur-onglet .onglet'
          );
          for (let i = 0; i < onglets.length; i++) {
            onglets[i].inert = true;
          }
          setTimeout(() => {
            const ongletPlanAction = document.querySelector(
              '#conteneur-mesure .conteneur-onglet .onglet:nth-of-type(2)'
            );
            ongletPlanAction?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
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
            .dispatchEvent(new MouseEvent('click', { bubbles: true }));
          const bouton = document.querySelector<HTMLButtonElement>(
            '#conteneur-mesure .conteneur-actions button'
          );
          if (bouton) bouton.disabled = true;
          const boutonFermeture =
            document.querySelector<HTMLButtonElement>('.fermeture-tiroir');
          if (boutonFermeture) boutonFermeture.disabled = true;
          const onglets = document.querySelectorAll<HTMLDivElement>(
            '#conteneur-mesure .conteneur-onglet .onglet'
          );
          for (let i = 0; i < onglets.length; i++) {
            onglets[i].inert = true;
          }
          setTimeout(() => {
            const ongletActivites = document.querySelector(
              '#conteneur-mesure .conteneur-onglet .onglet:nth-of-type(3)'
            );
            ongletActivites?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
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
        callbackInitialeCible: async (cible) => cible?.removeAttribute('href'),
        margeElementMisEnAvant: 0,
        positionnementModale: 'BasMilieu',
        titre: "Améliorez l'indice cyber de votre service",
        description:
          'Mettez en œuvre les mesures proposées et obtenez une évaluation indicative du niveau de sécurisation de votre service.',
        animation: '/statique/assets/images/visiteGuidee/indice_cyber.gif',
      },
    ];
  });
</script>

{#if ciblePremiereMesure && cibleOnglets && cibleGererContributeurs && cibleTiroirMesure && cibleIndiceCyber}
  <ModaleSousEtape {sousEtapes} />
{/if}
