<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';
  import { utilisateurCourant, visiteGuidee } from '../../visiteGuidee.store';
  import type { SousEtape } from '../../kit/ModaleSousEtape';

  let cibleNomService: HTMLElement;
  let cibleCentreNotifications: HTMLElement;
  let cibleNouveauService: HTMLElement;
  let cibleLignePremierService: HTMLElement;

  const elementDeClasse = (classe: string) =>
    document.getElementsByClassName(classe)[0]! as HTMLElement;

  onMount(() => {
    rechargeEtape();
  });

  const rechargeEtape = () => {
    cibleNomService = elementDeClasse('cellule-noms');
    cibleLignePremierService = elementDeClasse('ligne-service');
    cibleCentreNotifications = elementDeClasse('centre-notifications');
    cibleNouveauService = elementDeClasse('nouveau-service');
  };

  document.body.addEventListener('svelte-tableau-des-services-rafraichi', () =>
    rechargeEtape()
  );

  const derniereSousEtape = (): SousEtape | null => {
    if (!cibleNouveauService || !cibleLignePremierService) {
      return null;
    }
    if ($utilisateurCourant.profilComplet) {
      return {
        cible: cibleNouveauService,
        positionnementModale: 'HautGauche',
        margesElementMisEnAvant: '3 3 -3 3',
        callbackInitialeCible: (cible) => {
          const cibleBouton = cible.getElementsByClassName(
            'bouton'
          )[0] as HTMLButtonElement;
          cibleBouton.inert = true;
        },
        titre: 'Créez votre premier service !',
        description:
          'N’attendez plus et commencez à sécuriser en créant votre premier service numérique !',
        texteBoutonDerniereEtape: "C'est parti !",
      };
    }
    return {
      cible: cibleLignePremierService,
      positionnementModale: 'HautMilieu',
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

{#if cibleNomService && cibleCentreNotifications && cibleNouveauService && cibleLignePremierService}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: cibleNomService,
        positionnementModale: 'BasDroite',
        callbackInitialeCible: () => {
          document
            .getElementsByClassName('lien-service')[0]
            .removeAttribute('href');
          document.getElementsByClassName(
            'selection-service'
          )[0].disabled = true;
        },
        titre: 'Pilotez vos services grâce au tableau de bord',
        description:
          "Suivez l'état de vos homologations, la progression de vos mesures de sécurité et bénéficiez de recommandations personnalisées pour optimiser la protection de vos services.",
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
      derniereSousEtape(),
    ]}
  />
{/if}
