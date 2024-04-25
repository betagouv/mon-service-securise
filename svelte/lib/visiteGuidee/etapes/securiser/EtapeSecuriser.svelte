<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleTiroirMesure: HTMLDivElement;

  onMount(() => {
    cibleTiroirMesure = document.getElementsByClassName(
      'tiroir'
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
        },
        delaiAvantAffichage: 200,
        avecTrouRideauColle: true,
        callbackFinaleCible: () => {},
        positionnementModale: 'HautGauche',
        titre: 'Sécurisez, grâce à des mesures adaptées',
        description:
          'Chaque mesure est associée à son référentiel (ANSSI, CNIL) et son niveau d’importance (recommandée ou indispensable pour les mesures ANSSI).',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
    ]}
  />
{/if}
