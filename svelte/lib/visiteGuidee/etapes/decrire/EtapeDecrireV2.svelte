<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount, tick } from 'svelte';
  import { navigationStore } from '../../../creationV2/etapes/navigation.store';

  let cibleNomService: HTMLElement;
  let cibleBesoinsSecurite: HTMLElement;

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

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
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

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  };

  const recupereCibleNomService = () =>
    document
      .querySelector('dsfr-input[nom="nom-service"]')
      ?.shadowRoot?.getElementById('nom-service') as HTMLInputElement;

  onMount(async () => {
    cibleNomService = recupereCibleNomService();
    cibleBesoinsSecurite = document.getElementById('niveaux-securite')!;
  });
</script>

<ModaleSousEtape
  sousEtapes={[
    {
      cible: cibleNomService,
      callbackInitialeCible: async () => {
        navigationStore.retourneEtapeNomService();
        await detecteElementHTML('dsfr-input[nom="nom-service"]');
        await detecteElementADisparu('#niveaux-securite');
        cibleNomService = recupereCibleNomService();
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
        cibleBesoinsSecurite = await detecteElementHTML('#niveaux-securite');
        cibleBesoinsSecurite.scrollIntoView({ behavior: 'instant' });
        if (cibleBesoinsSecurite) cibleBesoinsSecurite.inert = true;
        return cibleBesoinsSecurite;
      },
      positionnementModale: 'HautMilieu',
      titre: 'Sélectionnez le besoin de sécurité',
      description:
        'Sélectionnez les besoins identifiés par l’ANSSI ou des besoins plus élevés pour découvrir la liste des mesures pour sécuriser votre service.',
    },
  ]}
/>
