import { get, writable } from 'svelte/store';
import {
  type EtapeDuWizard,
  toutesEtapes,
  toutesEtapesModeRapide,
} from './toutesEtapes';
import type { BrouillonServiceV2 } from '../creationV2.types';

type EtatNavigation = {
  etapeEnCours: number;
  questionEnCours: number;
  modeRapide: boolean;
  toutesEtapes: Array<EtapeDuWizard>;
  configuration: {
    toutesEtapesModeRapide: Array<EtapeDuWizard>;
    toutesEtapesModeNormal: Array<EtapeDuWizard>;
  };
};

const etatNavigation = writable<EtatNavigation>({
  etapeEnCours: 0,
  questionEnCours: 0,
  modeRapide: false,
  toutesEtapes: toutesEtapes,
  configuration: {
    toutesEtapesModeRapide: toutesEtapesModeRapide,
    toutesEtapesModeNormal: toutesEtapes,
  },
});

type NavigationStore = {
  subscribe: typeof etatNavigation.subscribe;
  precedent: () => void;
  suivant: () => void;
  retourneEtapeNomService: () => void;
  avanceEtapeBesoinsSecurite: () => void;
  reprendreEditionDe: (
    brouillon: BrouillonServiceV2,
    modeRapide: boolean
  ) => void;
  changeModeEdition: (modeRapide: boolean) => void;
  chargeConfigurationEtapes: (
    etapesModeNormal: Array<EtapeDuWizard>,
    etapesModeRapide: Array<EtapeDuWizard>
  ) => void;
};

export const navigationStore: NavigationStore = {
  subscribe: etatNavigation.subscribe,
  precedent: () => {
    etatNavigation.update((etat) => {
      let etapePrecedente = etat.etapeEnCours;
      let questionPrecedente: number;
      if (etat.questionEnCours === 0) {
        etapePrecedente -= 1;
        questionPrecedente =
          etat.toutesEtapes[etapePrecedente].questions.length - 1;
      } else {
        questionPrecedente = etat.questionEnCours - 1;
      }
      return {
        ...etat,
        etapeEnCours: etapePrecedente,
        questionEnCours: questionPrecedente,
      };
    });
  },
  suivant: () => {
    etatNavigation.update((etat) => {
      let prochaineEtape = etat.etapeEnCours;
      let prochaineQuestion = etat.questionEnCours + 1;
      if (
        etat.questionEnCours ===
        etat.toutesEtapes[etat.etapeEnCours].questions.length - 1
      ) {
        prochaineQuestion = 0;
        prochaineEtape += 1;
      }
      return {
        ...etat,
        etapeEnCours: prochaineEtape,
        questionEnCours: prochaineQuestion,
      };
    });
  },
  changeModeEdition: (modeRapide: boolean) => {
    etatNavigation.update((etat) => {
      return {
        ...etat,
        modeRapide,
      };
    });
  },
  retourneEtapeNomService: () => {
    etatNavigation.update((etat) => {
      return {
        ...etat,
        etapeEnCours: 0,
        questionEnCours: 0,
      };
    });
  },
  avanceEtapeBesoinsSecurite: () => {
    etatNavigation.update((etat) => {
      return {
        ...etat,
        etapeEnCours: 4,
        questionEnCours: 0,
      };
    });
  },
  chargeConfigurationEtapes: (
    etapesModeNormal: Array<EtapeDuWizard>,
    etapesModeRapide: Array<EtapeDuWizard>
  ) => {
    etatNavigation.update((etat) => {
      return {
        ...etat,
        toutesEtapes: etat.modeRapide ? etapesModeRapide : etapesModeNormal,
        configuration: {
          toutesEtapesModeNormal: etapesModeNormal,
          toutesEtapesModeRapide: etapesModeRapide,
        },
      };
    });
  },
  reprendreEditionDe: (
    donneesBrouillon: BrouillonServiceV2,
    modeRapide: boolean
  ) => {
    let questionPrecedente = { etape: 0, question: 0 };
    let cibleTrouvee = false;

    const configuration = get(etatNavigation).configuration;
    const etapesDuWizard = modeRapide
      ? configuration.toutesEtapesModeRapide
      : configuration.toutesEtapesModeNormal;

    for (let e = 0; e < etapesDuWizard.length; e++) {
      const etape = etapesDuWizard[e];
      for (let q = 0; q < etape.questions.length; q++) {
        const question = etape.questions[q];
        const questionEstSansReponse = question.clesPropriete.every(
          (clePropriete) => donneesBrouillon[clePropriete]?.length === 0
        );
        if (questionEstSansReponse) {
          cibleTrouvee = true;
          break;
        }
        questionPrecedente = { etape: e, question: q };
      }
      if (cibleTrouvee) break;
    }

    etatNavigation.update((etat) => ({
      ...etat,
      etapeEnCours: questionPrecedente.etape,
      questionEnCours: questionPrecedente.question,
      modeRapide,
      toutesEtapes: etapesDuWizard,
    }));
  },
};
