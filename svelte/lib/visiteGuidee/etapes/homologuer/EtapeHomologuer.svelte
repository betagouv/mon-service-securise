<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';
  import type { SousEtape } from '../../kit/ModaleSousEtape';

  let cibleNouvelleHomologation: HTMLElement = $state();
  let cibleTelechargement: HTMLElement = $state();

  let sousEtapes: SousEtape[] = $state([]);
  onMount(() => {
    cibleNouvelleHomologation = document.getElementById(
      'commencer-homologation'
    )!;
    cibleTelechargement = document.getElementById('voir-telechargement')!;
    sousEtapes = [
      {
        cible: cibleNouvelleHomologation,
        callbackInitialeCible: async () => {
          const bouton = document.getElementById('commencer-homologation');
          if (bouton) bouton.inert = true;
          document.body.dispatchEvent(
            new CustomEvent('jquery-replie-menu-navigation-visite-guidee')
          );
        },
        positionnementModale: 'BasGauche',
        titre: 'Homologuez votre service',
        description:
          "Générez un dossier et un projet de décision d'homologation pour vous mettre en conformité avec la réglementation.",
        animation: '/statique/assets/images/visiteGuidee/homologuer.gif',
        margeElementMisEnAvant: 3,
        delaiAvantAffichage: 300,
      },
      {
        cible: cibleTelechargement,
        callbackInitialeCible: async (cible) => {
          document.body.dispatchEvent(
            new CustomEvent(
              'jquery-affiche-tiroir-telechargement-visite-guidee'
            )
          );
          document.body.dispatchEvent(
            new CustomEvent('jquery-replie-menu-navigation-visite-guidee')
          );
          const tiroir = document.querySelector<HTMLDivElement>('.tiroir');
          if (tiroir) tiroir.style.zIndex = '10001';
          const boutonFermeture =
            document.querySelector<HTMLButtonElement>('.fermeture-tiroir');
          if (boutonFermeture) boutonFermeture.disabled = true;
          cible.inert = true;
        },
        callbackFinaleCible: async () => {
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
        delaiAvantAffichage: 300,
      },
    ];
  });
</script>

{#if cibleNouvelleHomologation && cibleTelechargement}
  <ModaleSousEtape {sousEtapes} />
{/if}
