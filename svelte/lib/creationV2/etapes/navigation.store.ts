import { writable } from 'svelte/store';
import { toutesEtapes } from './toutesEtapes';
import type { BrouillonIncomplet } from '../creationV2.types';

type EtatNavigation = { etapeEnCours: number; questionEnCours: number };

const etatNavigation = writable<EtatNavigation>({
  etapeEnCours: 0,
  questionEnCours: 0,
});

type NavigationStore = {
  subscribe: typeof etatNavigation.subscribe;
  precedent: () => void;
  suivant: () => void;
  reprendreEditionDe: (brouillon: BrouillonIncomplet) => void;
};

export const navigationStore: NavigationStore = {
  subscribe: etatNavigation.subscribe,
  precedent: () => {
    etatNavigation.update((etat) => {
      let etapePrecedente = etat.etapeEnCours;
      let questionPrecedente: number;
      if (etat.questionEnCours === 0) {
        etapePrecedente -= 1;
        questionPrecedente = toutesEtapes[etapePrecedente].questions.length - 1;
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
        toutesEtapes[etat.etapeEnCours].questions.length - 1
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
  reprendreEditionDe: (donneesBrouillon: BrouillonIncomplet) => {
    let questionPrecedente = { etape: 0, question: 0 };
    let cibleTrouvee = false;

    for (let e = 0; e < toutesEtapes.length; e++) {
      const etape = toutesEtapes[e];
      for (let q = 0; q < etape.questions.length; q++) {
        const question = etape.questions[q];
        const questionEstSansReponse = question.clesPropriete.every(
          (clePropriete) => donneesBrouillon[clePropriete] === undefined
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
    }));
  },
};
