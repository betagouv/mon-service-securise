import type { ReferentielPagesService } from '../pagesService/pagesService';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-visite-guidee-spa': CustomEvent;
  }
}

export type VisiteGuideeSPAProps = {
  referentiel: ReferentielPagesService;
  featureFlags: {
    avecRisquesV2: boolean;
  };
  nonce: string;
};

export type PageFondVisiteGuidee =
  | 'tableauDeBord'
  | 'creationV2'
  | 'besoinsSecuriteV2'
  | 'risques'
  | 'mesures'
  | 'dossiers';

export type EtapeVisiteGuidee = 1 | 2 | 3 | 4;

export type DonneesEtapeVisiteGuidee = {
  pageFond: PageFondVisiteGuidee;
  titre: string;
  description: string;
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
  },
  2: {
    pageFond: 'mesures',
    titre:
      'Des mesures adaptées, issues des référentiels ANSSI (ReCyF) et CNIL',
    description:
      "Chaque mesure est décrite, priorisée et rattachée à son référentiel (ANSSI, CNIL). En les mettant en œuvre, vous faites progresser l'indice cyber, évaluation indicative du niveau de sécurisation de votre service.",
  },
  3: {
    pageFond: 'mesures',
    titre: "Suivez l'avancement de vos mesures",
    description:
      "Statut, priorité, échéance : vous voyez d'un coup d'œil où en est chaque mesure et ce qui arrive à terme.",
  },
  4: {
    pageFond: 'risques',
    titre: 'Vos risques sont déjà identifiés',
    description:
      'MonServiceSécurisé propose une liste de risques pré-remplie à partir de la description de votre service. Visualisez les vraisemblances et gravités de chaque risque sur une matrice et leurs évolutions en fonction de l’avancement de votre plan d’action cyber.',
  },
};
