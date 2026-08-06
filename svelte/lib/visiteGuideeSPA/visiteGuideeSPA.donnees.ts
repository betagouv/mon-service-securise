import { ciblage } from '../visiteGuidee/ciblage';
import type {
  DonneesEtapeVisiteGuidee,
  EtapeVisiteGuidee,
} from './visiteGuideeSPA.d';
import { tiroirStore } from '../ui/stores/tiroir.store';

const detecteElementHTML = async (selecteur: string): Promise<HTMLElement> => {
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

export const donneesEtapesVisiteGuidee: Record<
  EtapeVisiteGuidee,
  DonneesEtapeVisiteGuidee
> = {
  1: {
    pageFond: 'besoinsSecuriteV2',
    titre: 'Évaluez les besoins de sécurité de votre service',
    description:
      'Quelques questions sur votre service suffisent. MonServiceSécurisé en déduit son niveau de besoin de sécurité et les mesures qui en découlent.',
    callbackAvantOuverture: async () => {
      tiroirStore.ferme();
      await detecteElementHTML(
        ciblage().decrireV2().besoinsSecurite('niveau1').query()
      );
    },
    ouverture: () => ciblage().decrireV2().besoinsSecurite('niveau1').el(),
  },
  2: {
    pageFond: 'mesures',
    titre:
      'Des mesures adaptées, issues des référentiels ANSSI (ReCyF) et CNIL',
    description:
      "Chaque mesure est décrite, priorisée et rattachée à son référentiel (ANSSI, CNIL). En les mettant en œuvre, vous faites progresser l'indice cyber, évaluation indicative du niveau de sécurisation de votre service.",
    callbackAvantOuverture: async () => {
      const premiereMesure = await detecteElementHTML(
        ciblage().securiser().premiereMesure().query()
      );
      premiereMesure.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    },
    ouverture: () => ciblage().tiroir().el(),
    decoupe: { marge: 0, rayon: 0 },
  },
  3: {
    pageFond: 'mesures',
    titre: "Suivez l'avancement de vos mesures",
    description:
      "Statut, priorité, échéance : vous voyez d'un coup d'œil où en est chaque mesure et ce qui arrive à terme.",
    ouverture: () => ciblage().securiser().premiereLigneMesure().el(),
    callbackAvantOuverture: async () => {
      tiroirStore.ferme();
      await detecteElementHTML(
        ciblage().securiser().premiereLigneMesure().query()
      );
    },
  },
  4: {
    pageFond: 'risques',
    titre: 'Vos risques sont déjà identifiés',
    description:
      'MonServiceSécurisé propose une liste de risques pré-remplie à partir de la description de votre service. Visualisez les vraisemblances et gravités de chaque risque sur une matrice et leurs évolutions en fonction de l’avancement de votre plan d’action cyber.',
    ouverture: () => ciblage().securiser().matriceRisquesV2().el(),
    callbackAvantOuverture: async () => {
      await detecteElementHTML(
        ciblage().securiser().matriceRisquesV2().query()
      );
    },
  },
};
