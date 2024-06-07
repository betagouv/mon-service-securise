<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';
  import { utilisateurCourant, visiteGuidee } from '../../visiteGuidee.store';
  import type { SousEtape } from '../../kit/ModaleSousEtape';

  let cibleNomService: HTMLElement;
  let cibleCentreNotifications: HTMLElement;
  let cibleBOM: HTMLElement;
  let cibleNouveauService: HTMLElement;
  let cibleLignePremierService: HTMLElement;

  const elementDeClasse = (classe: string) =>
    document.getElementsByClassName(classe)[0]! as HTMLElement;

  onMount(() => {
    // On utilise ici un mutation observer pour attendre que l'appel API
    // du tableau des services ait ajouté au DOM les éléments de ligne service
    const observateur = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((noeud) => {
          if (noeud.classList.contains('ligne-service')) {
            cibleNomService = elementDeClasse('cellule-noms');
            cibleLignePremierService = elementDeClasse('ligne-service');
          }
        });
      });
    });
    observateur.observe(elementDeClasse('contenu-tableau-services'), {
      childList: true,
      subtree: false,
    });

    cibleCentreNotifications = elementDeClasse('centre-notifications');
    cibleBOM = elementDeClasse('bom-modale');
    cibleNouveauService = elementDeClasse('nouveau-service');
  });

  const derniereSousEtape = (): SousEtape | null => {
    if (!cibleNouveauService || !cibleLignePremierService) {
      return null;
    }
    if ($utilisateurCourant.profilComplet) {
      return {
        cible: cibleNouveauService,
        positionnementModale: 'HautGauche',
        margeElementMisEnAvant: 3,
        callbackInitialeCible: (cible) => {
          cible.addEventListener(
            'click',
            async () => await visiteGuidee.finalise()
          );
          cible.removeAttribute('href');
        },
        titre: 'Créez votre premier service !',
        description:
          'N’attendez plus et commencez à sécuriser en créant votre premier service numérique !',
        texteBoutonDerniereEtape: "C'est parti !",
      };
    }
    return {
      cible: cibleLignePremierService,
      positionnementModale: 'BasMilieu',
      callbackInitialeCible: (cible) => {
        cible.inert = true;
      },
      titre: 'Collaborez avec votre équipe !',
      description:
        'N’attendez plus et contribuez au service numérique sur lequel vous avez été invité !',
      texteBoutonDerniereEtape: 'Je découvre le service',
    };
  };
</script>

{#if cibleNomService && cibleCentreNotifications && cibleBOM && cibleNouveauService && cibleLignePremierService}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: cibleNomService,
        positionnementModale: 'MilieuDroite',
        callbackInitialeCible: () => {
          document
            .getElementsByClassName('conteneur-noms')[0]
            .removeAttribute('href');
          document.getElementsByClassName(
            'selection-service'
          )[0].disabled = true;
        },
        titre: 'Pilotez vos services grâce au tableau de bord',
        description:
          "Gérez de manière centralisée vos services, avec des outils de productivité intégrés comme la duplication et l'invitation de contributeurs.",
        animation: '/statique/assets/images/visiteGuidee/tableau_de_bord.gif',
      },
      {
        cible: cibleCentreNotifications,
        positionnementModale: 'BasMilieu',
        margeElementMisEnAvant: 3,
        callbackInitialeCible: (cible) => {
          cible.disabled = true;
        },
        titre: 'Découvrez le centre de notifications',
        description:
          'Ne ratez aucune information ou nouveauté importante de MonServiceSécurisé !',
        animation: '/statique/assets/images/visiteGuidee/nouveautes.gif',
      },
      {
        cible: cibleBOM,
        positionnementModale: 'BasGauche',
        margeElementMisEnAvant: 3,
        callbackInitialeCible: () => {
          document
            .getElementsByClassName('bom-titre')[0]
            .dispatchEvent(new Event('click'));
          document.querySelector('.bom-modale .fermeture').disabled = true;
          document
            .querySelectorAll('.bom-modale .contenu a')
            .forEach((lien) => lien.removeAttribute('href'));
        },
        callbackFinaleCible: () => {
          document
            .querySelector('.bom-modale .fermeture')
            .dispatchEvent(new Event('click'));
        },
        titre: 'Trouvez des réponses à vos questions',
        description:
          'Notre équipe est à votre disposition pour vous accompagner, par chat, webinaire ou FAQ. N’hésitez pas à nous faire vos retours sur le produit, nous les lirons avec attention.',
        animation: '/statique/assets/images/visiteGuidee/bom.gif',
      },
      derniereSousEtape(),
    ]}
  />
{/if}
