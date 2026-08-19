import { ciblage } from './ciblage';
import type {
  DonneesEtapeVisiteGuidee,
  EtapeVisiteGuidee,
  EtapeVisiteGuideeAdditionnelle,
} from './visiteGuideeSPA.d';
import { tiroirStore } from '../ui/stores/tiroir.store';
import TiroirTeleversementServicesV2 from '../tableauDeBord/televersementServices/TiroirTeleversementServicesV2.svelte';
import { tick } from 'svelte';
import TiroirGestionContributeurs from '../ui/tiroirs/TiroirGestionContributeurs.svelte';

const detecteElementHTML = async (
  selecteur: string,
  index = 0
): Promise<HTMLElement> => {
  return new Promise((resolve) => {
    const el = document.querySelectorAll(selecteur)[index] as
      | HTMLElement
      | undefined;
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelectorAll(selecteur)[index] as
        | HTMLElement
        | undefined;
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
};

export const donneesEtapesVisiteGuideeAdditionnelle: Record<
  EtapeVisiteGuideeAdditionnelle,
  DonneesEtapeVisiteGuidee
> = {
  contributeurs: {
    pageFond: 'mesures',
    titre: 'Travaillez avec votre équipe',
    description:
      "Invitez vos contributeurs et vos prestataires, désignez un responsable par mesure et ajustez leurs droits d'accès.",
    callbackAvantOuverture: async () => {
      await tick();
      tiroirStore.afficheContenu(TiroirGestionContributeurs, {
        modeVisiteGuidee: true,
        services: [],
      });
      await detecteElementHTML(ciblage().tiroir().query());
    },
    ouverture: () => ciblage().tiroir().el(),
    ouvertureSecondaire: () => ciblage().securiser().gererContributeurs().el(),
    decoupe: { marge: 0, rayon: 0 },
    positionModale: 'droite',
    decalageModale: 24,
  },
  'liste-mesures': {
    pageFond: 'liste-mesures',
    titre: 'Gérez vos mesures depuis un seul endroit',
    description:
      "La liste centralisée rassemble toutes vos mesures, tous services confondus. Modifiez le statut ou la précision d'une mesure une fois — la modification s'applique à tous les services que vous sélectionnez.",
    descriptionAdditionnelle:
      "Vous pouvez aussi importer jusqu'à 40 mesures propres à votre organisation et les gérer de la même façon.",
    ouverture: () => ciblage().listeMesures().el(),
    callbackAvantOuverture: async () => {
      await tick();
      await detecteElementHTML(ciblage().listeMesures().query());
    },
    positionModale: 'bas',
    decalageModale: 14,
  },
  televersement: {
    pageFond: 'tableauDeBord',
    titre: "Jusqu'à 250 services importés en une seule fois",
    description:
      "Remplissez le modèle XLSX fourni et importez jusqu'à 250 services, homologués ou non. Un rapport vous signale ligne par ligne ce qui doit être corrigé avant validation. ",
    callbackAvantOuverture: async () => {
      await tick();
      tiroirStore.afficheContenu(TiroirTeleversementServicesV2, {});
      await detecteElementHTML(ciblage().tiroir().query());
    },
    ouverture: () => ciblage().tiroir().el(),
    decoupe: { marge: 0, rayon: 0 },
    positionModale: 'droite',
    decalageModale: 24,
  },
  organisations: {
    pageFond: 'statistiques',
    titre: 'Suivez tous les services de votre entité',
    description:
      "Les services créés sous le SIRET de vos entités vous sont rattachés automatiquement. Vous suivez leur avancement, les personnes qui y contribuent, et la sécurisation de l'ensemble depuis un tableau de bord statistique.",
    descriptionAdditionnelle:
      "Accès réservé aux admins. Contactez l'équipe MonServiceSécurisé pour en savoir plus.",
    ouverture: () => ciblage().statistiques().el(),
    positionModale: 'bas',
    decalageModale: 200,
  },
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
    positionModale: 'bas',
    decalageModale: 14,
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
    positionModale: 'droite',
    decalageModale: 24,
  },
  3: {
    pageFond: 'mesures',
    titre: "Suivez l'avancement de vos mesures",
    description:
      "Statut, priorité, échéance : vous voyez d'un coup d'œil où en est chaque mesure et ce qui arrive à terme.",
    ouverture: () => ciblage().securiser().deuxiemeLigneMesure().el(),
    callbackAvantOuverture: async () => {
      tiroirStore.ferme();
      await detecteElementHTML(
        ciblage().securiser().deuxiemeLigneMesure().query(),
        1
      );
    },
    positionModale: 'bas',
    decalageModale: 14,
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
    positionModale: 'droite',
    decalageModale: 160,
    ouvertureSuivante: {
      delai: 4000,
      ouverture: () => ciblage().securiser().lignesRisques([1, 2, 3]).el(),
    },
  },
};
