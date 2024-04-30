<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleNouvelleHomologation: HTMLElement;
  let cibleTelechargement: HTMLElement;
  onMount(() => {
    cibleNouvelleHomologation = document.getElementById('suivant')!;
    cibleTelechargement = document.getElementById('voir-telechargement')!;
  });
</script>

{#if cibleNouvelleHomologation && cibleTelechargement}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: cibleNouvelleHomologation,
        callbackInitialeCible: () => {
          document.getElementById('suivant').inert = true;
        },
        positionnementModale: 'HautDroite',
        titre: 'Mettez-vous en conformité',
        description:
          "Générez un dossier et un projet de décision d'homologation pour vous mettre en conformité avec la réglementation",
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
      {
        cible: cibleTelechargement,
        callbackInitialeCible: (cible) => {
          document.body.dispatchEvent(
            new CustomEvent(
              'jquery-affiche-tiroir-telechargement-visite-guidee'
            )
          );
          document.getElementsByClassName('tiroir')[0].style.zIndex = '10001';
          document.getElementsByClassName(
            'fermeture-tiroir'
          )[0].disabled = true;
          cible.inert = true;
        },
        callbackFinaleCible: () => {
          document
            .getElementsByClassName('fermeture-tiroir')[0]
            .dispatchEvent(new Event('click'));
        },
        avecTrouRideauColle: true,
        positionnementModale: 'BasDroite',
        titre: 'Homologuez en toute simplicité',
        description:
          'Téléchargez en 1 clic, le dossier et le projet de décision d’homologation pour le faire signer.',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
      },
    ]}
  />
{/if}
