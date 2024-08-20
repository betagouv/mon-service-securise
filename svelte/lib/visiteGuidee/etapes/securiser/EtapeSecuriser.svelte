<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let ciblePremiereMesure: HTMLDivElement;
  let cibleIndiceCyber: HTMLDivElement;
  onMount(() => {
    ciblePremiereMesure = document.getElementsByClassName(
      'titre-mesure'
    )[0]! as HTMLDivElement;
    cibleIndiceCyber = document.getElementsByClassName(
      'conteneur-indice-cyber'
    )[0]! as HTMLDivElement;
  });
</script>

{#if ciblePremiereMesure && cibleIndiceCyber}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: ciblePremiereMesure,
        callbackInitialeCible: (cible) => {
          const ligneMesure = cible.parentElement;
          if (ligneMesure) ligneMesure.inert = true;
        },
        delaiAvantAffichage: 200,
        positionnementModale: 'DeuxTiersCentre',
        titre: 'Sécurisez, grâce à des mesures adaptées',
        description:
          'Chaque mesure est associée à son référentiel (ANSSI, CNIL) et son niveau d’importance (recommandée ou indispensable pour les mesures ANSSI).',
        animation: '/statique/assets/images/visiteGuidee/securiser_1.gif',
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
