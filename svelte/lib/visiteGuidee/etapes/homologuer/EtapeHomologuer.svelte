<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleNouvelleHomologation: HTMLElement;
  let cibleTelechargement: HTMLElement;
  onMount(() => {
    cibleNouvelleHomologation = document.getElementById(
      'commencer-homologation'
    )!;
    cibleTelechargement = document.getElementById('voir-telechargement')!;
  });
</script>

{#if cibleNouvelleHomologation && cibleTelechargement}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: cibleNouvelleHomologation,
        callbackInitialeCible: () => {
          document.getElementById('commencer-homologation').inert = true;
        },
        positionnementModale: 'BasGauche',
        titre: 'Homologuez votre service',
        description:
          "Générez un dossier et un projet de décision d'homologation pour vous mettre en conformité avec la réglementation.",
        animation: '/statique/assets/images/visiteGuidee/homologuer.gif',
        margeElementMisEnAvant: 3,
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
        margeElementMisEnAvant: 3,
        positionnementModale: 'BasDroite',
        titre: 'Téléchargez vos documents utiles',
        description:
          "Obtenez en 1 clic le dossier et le projet de décision pour signature par votre autorité d'homologation.",
        animation: '/statique/assets/images/visiteGuidee/pdf.gif',
      },
    ]}
  />
{/if}
