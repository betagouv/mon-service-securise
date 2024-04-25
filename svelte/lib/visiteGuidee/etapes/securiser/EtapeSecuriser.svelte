<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleTiroirMesure: HTMLDivElement;
  let cibleIndiceCyber: HTMLDivElement;
  onMount(() => {
    cibleTiroirMesure = document.getElementsByClassName(
      'tiroir'
    )[0]! as HTMLDivElement;
    cibleIndiceCyber = document.getElementsByClassName(
      'conteneur-indice-cyber'
    )[0]! as HTMLDivElement;
  });
</script>

{#if cibleTiroirMesure}
  <ModaleSousEtape
    sousEtapes={[
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
        },
        delaiAvantAffichage: 200,
        avecTrouRideauColle: true,
        callbackFinaleCible: () => {
          document
            .getElementsByClassName('fermeture-tiroir')[0]
            .dispatchEvent(new Event('click'));
        },
        positionnementModale: 'MilieuGauche',
        titre: 'Sécurisez, grâce à des mesures adaptées',
        description:
          'Chaque mesure est associée à son référentiel (ANSSI, CNIL) et son niveau d’importance (recommandée ou indispensable pour les mesures ANSSI).',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
      {
        cible: cibleIndiceCyber,
        callbackInitialeCible: (cible) => cible.removeAttribute('href'),
        avecTrouRideauColle: true,
        positionnementModale: 'HautGauche',
        titre: 'Indice cyber',
        description:
          "Mettez en œuvre les mesures proposées et obtenez une évaluation indicative du niveau de sécurisation du service : l'indice cyber.",
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
    ]}
  />
{/if}
