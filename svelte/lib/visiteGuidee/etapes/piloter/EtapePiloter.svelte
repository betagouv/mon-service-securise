<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';
  import { utilisateurCourant } from '../../visiteGuidee.store';
  import type { SousEtape } from '../../kit/ModaleSousEtape';

  let cibleNomService: HTMLElement | undefined = $state();
  let cibleCentreNotifications: HTMLElement | undefined = $state();
  let cibleNouveauService: HTMLElement | undefined = $state();
  let cibleLignePremierService: HTMLElement | undefined = $state();

  const elementDeClasse = (classe: string) =>
    document.getElementsByClassName(classe)[0]! as HTMLElement;

  let sousEtapes: SousEtape[] = $state([]);
  onMount(() => {
    rechargeEtape();
    const derniereEtape = derniereSousEtape();
    sousEtapes = [
      {
        cible: cibleNomService,
        positionnementModale: 'BasDroite',
        margeElementMisEnAvant: 3,
        titre: 'Pilotez vos services grâce au tableau de bord',
        description:
          "Suivez l'état de vos homologations, la progression de vos mesures de sécurité et bénéficiez de recommandations personnalisées pour optimiser la protection de vos services.",
        animation: '/statique/assets/images/visiteGuidee/tableau_de_bord.gif',
      },
      {
        cible: cibleCentreNotifications,
        positionnementModale: 'BasMilieu',
        margeElementMisEnAvant: 3,
        titre: 'Découvrez le centre de notifications',
        description:
          'Ne ratez aucune information ou nouveauté importante de MonServiceSécurisé !',
        animation: '/statique/assets/images/visiteGuidee/nouveautes.gif',
      },
    ];
    if (derniereEtape) sousEtapes.push(derniereEtape);
  });

  const rechargeEtape = () => {
    cibleNomService = elementDeClasse('cellule-noms');
    cibleLignePremierService =
      document
        .querySelector('dsfr-table')
        ?.shadowRoot?.querySelector('tbody tr') ?? undefined;
    cibleCentreNotifications = elementDeClasse('centre-notifications');
    cibleNouveauService = elementDeClasse('nouveau-service');
  };

  document.body.addEventListener('svelte-tableau-des-services-rafraichi', () =>
    rechargeEtape()
  );

  const derniereSousEtape = (): SousEtape | null => {
    if (!cibleNouveauService || !cibleLignePremierService) return null;

    if ($utilisateurCourant.profilComplet) {
      return {
        cible: cibleNouveauService,
        positionnementModale: 'HautGauche',
        margesElementMisEnAvant: '3 3 3 3',
        titre: 'Créez votre premier service !',
        description:
          'N’attendez plus et commencez à sécuriser en créant votre premier service numérique !',
        texteBoutonDerniereEtape: "C'est parti !",
      };
    }

    return {
      cible: cibleLignePremierService,
      positionnementModale: 'HautMilieu',
      titre: 'Collaborez avec votre équipe !',
      description:
        'N’attendez plus et contribuez au service numérique sur lequel vous avez été invité !',
      texteBoutonDerniereEtape: 'Je découvre le service',
    };
  };
</script>

{#if cibleNomService && cibleCentreNotifications && cibleNouveauService && cibleLignePremierService}
  <ModaleSousEtape {sousEtapes} />
{/if}
