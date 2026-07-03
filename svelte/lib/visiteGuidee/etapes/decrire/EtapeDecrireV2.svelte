<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount, tick } from 'svelte';
  import { navigationStore } from '../../../creationV2/etapes/navigation.store';
  import { ciblage } from '../../ciblage';

  let cibleNomService: HTMLElement | undefined = $state();
  let cibleBesoinsSecurite: HTMLElement | undefined = $state();

  const detecteElementHTML = async (
    selecteur: string
  ): Promise<HTMLElement> => {
    return new Promise((resolve) => {
      const el: HTMLElement | null = document.querySelector(selecteur);
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const el: HTMLElement | null = document.querySelector(selecteur);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  };

  const detecteElementADisparu = async (selecteur: string): Promise<void> => {
    return new Promise((resolve) => {
      const el: HTMLElement | null = document.querySelector(selecteur);
      if (!el) return resolve();

      const observer = new MutationObserver(() => {
        const el: HTMLElement | null = document.querySelector(selecteur);
        if (!el) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  };

  onMount(async () => {
    cibleNomService = ciblage().decrireV2().nomService().el();
    cibleBesoinsSecurite = ciblage()
      .decrireV2()
      .besoinsSecurite('niveau1')
      .el();
  });
</script>

<ModaleSousEtape
  sousEtapes={[
    {
      cible: cibleNomService,
      callbackInitialeCible: async () => {
        navigationStore.retourneEtapeNomService();
        await detecteElementHTML(ciblage().decrireV2().nomService().query());
        await detecteElementADisparu('#niveaux-securite');
        cibleNomService = ciblage().decrireV2().nomService().el();
        cibleNomService.scrollIntoView({ behavior: 'instant' });
        return cibleNomService;
      },
      positionnementModale: 'MilieuDroite',
      titre: 'Ajoutez votre service',
      description:
        'Dans un premier temps, répondez à quelques questions afin d’obtenir une liste de mesures de sécurité personnalisée.',
      margeElementMisEnAvant: 64,
    },
    {
      cible: cibleBesoinsSecurite,
      callbackInitialeCible: async () => {
        navigationStore.avanceEtapeBesoinsSecurite();
        await tick();
        cibleBesoinsSecurite = await detecteElementHTML(
          ciblage().decrireV2().besoinsSecurite('niveau1').query()
        );
        cibleBesoinsSecurite.scrollIntoView({
          behavior: 'instant',
          block: 'end',
        });
        return cibleBesoinsSecurite;
      },
      positionnementModale: 'HautMilieu',
      titre: 'Sélectionnez le besoin de sécurité',
      description:
        'Sélectionnez les besoins identifiés par l’ANSSI ou des besoins plus élevés pour découvrir la liste des mesures pour sécuriser votre service.',
    },
  ]}
/>
