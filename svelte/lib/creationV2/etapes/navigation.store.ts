import { writable } from 'svelte/store';
import {
  type EtapeDuWizard,
  toutesEtapes,
  toutesEtapesModeRapide,
} from './toutesEtapes';
import type { BrouillonSvelte } from '../creationV2.types';

type EtatNavigation = {
  etapeEnCours: number;
  questionEnCours: number;
  modeRapide: boolean;
  toutesEtapes: Array<EtapeDuWizard>;
};

const etatNavigation = writable<EtatNavigation>({
  etapeEnCours: 0,
  questionEnCours: 0,
  modeRapide: false,
  toutesEtapes: toutesEtapes,
});

type NavigationStore = {
  subscribe: typeof etatNavigation.subscribe;
  precedent: () => void;
  suivant: () => void;
  reprendreEditionDe: (brouillon: BrouillonSvelte, modeRapide: boolean) => void;
  changeModeEdition: (modeRapide: boolean) => void;
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
  reprendreEditionDe: (
    donneesBrouillon: BrouillonSvelte,
    modeRapide: boolean
  ) => {
    let questionPrecedente = { etape: 0, question: 0 };
    let cibleTrouvee = false;

    const etapesDuWizard = modeRapide ? toutesEtapesModeRapide : toutesEtapes;

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

    etatNavigation.update(() => ({
      etapeEnCours: questionPrecedente.etape,
      questionEnCours: questionPrecedente.question,
      modeRapide,
      toutesEtapes: etapesDuWizard,
    }));
  },
};
