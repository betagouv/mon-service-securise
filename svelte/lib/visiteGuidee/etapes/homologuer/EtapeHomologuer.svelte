<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';
  import type { SousEtape } from '../../kit/ModaleSousEtape';
  import TiroirTelechargementDocumentsService from '../../../ui/tiroirs/TiroirTelechargementDocumentsService.svelte';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import { donneesVisiteGuidee } from '../../../tableauDeBord/tableauDeBord';

  let cibleNouvelleHomologation: HTMLElement | undefined = $state();
  let cibleTelechargement: HTMLElement | undefined = $state();

  let sousEtapes: SousEtape[] = $state([]);
  onMount(() => {
    cibleNouvelleHomologation = document.querySelector(
      'dsfr-button[nom="creer-homologation"]'
    ) as HTMLButtonElement;
    cibleTelechargement = document.getElementById('voir-telechargement')!;
    sousEtapes = [
      {
        cible: cibleNouvelleHomologation,
        callbackInitialeCible: async (cible) => {
          if (cible) {
            cible.inert = true;
          }
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
          tiroirStore.afficheContenu(TiroirTelechargementDocumentsService, {
            modeVisiteGuidee: true,
            service: donneesVisiteGuidee.services[0],
          });
          const tiroir = document.querySelector<HTMLDivElement>('#tiroir');
          if (tiroir) tiroir.style.zIndex = '10001';
          const boutonFermeture =
            document.querySelector<HTMLButtonElement>('.fermeture-tiroir');
          if (boutonFermeture) boutonFermeture.disabled = true;
          if (cible) cible.inert = true;
        },
        callbackFinaleCible: async () => {
          tiroirStore.ferme();
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
