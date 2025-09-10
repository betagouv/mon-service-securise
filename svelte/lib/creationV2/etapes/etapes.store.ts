import { derived, get, writable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';
import QuestionNomService from './etape1/QuestionNomService.svelte';
import QuestionSiret from './etape1/QuestionSiret.svelte';
import type { UUID } from '../../typesBasiquesSvelte';
import {
  creeBrouillonService,
  finaliseBrouillonService,
} from '../creationV2.api';

type QuestionProps = {
  estComplete: boolean;
  valeur: string | number;
};

type ComposantQuestion = typeof SvelteComponent<QuestionProps>;

type QuestionAvecIdentifiantPropriete = {
  clePropriete: string;
  composant: ComposantQuestion;
};

type PropsEtape = {
  numero: number;
  titre: string;
  questions: QuestionAvecIdentifiantPropriete[];
};

type EtatFormulaireCreation = {
  etapeEnCours: number;
  questionEnCours: number;
  idBrouillonExistant?: UUID;
};

const toutesEtapes: PropsEtape[] = [
  {
    numero: 1,
    titre: 'Informations génériques sur le projet',
    questions: [
      { clePropriete: 'nomService', composant: QuestionNomService },
      { clePropriete: 'siret', composant: QuestionSiret },
    ],
  },
];

export const toutesClesPropriete = toutesEtapes.flatMap((e) =>
  e.questions.flatMap((q) => q.clePropriete)
);

const { subscribe, update } = writable<EtatFormulaireCreation>({
  etapeEnCours: 0,
  questionEnCours: 0,
});

export const etapeStore = {
  finalise: async () => {
    await finaliseBrouillonService(get(etapeStore).idBrouillonExistant!);
    window.location.href = '/tableauDeBord';
  },
  precedent: () => {
    update((etatCourant) => {
      let etapePrecedente = etatCourant.etapeEnCours;
      let questionPrecedente: number;
      if (etatCourant.questionEnCours === 0) {
        etapePrecedente -= 1;
        questionPrecedente = toutesEtapes[etapePrecedente].questions.length - 1;
      } else {
        questionPrecedente = etatCourant.questionEnCours - 1;
      }
      return {
        ...etatCourant,
        etapeEnCours: etapePrecedente,
        questionEnCours: questionPrecedente,
      };
    });
  },
  subscribe,
  suivant: async (valeur: string | number) => {
    const etatActuel = get(etapeStore);
    if (
      !etatActuel.idBrouillonExistant &&
      etatActuel.etapeEnCours === 0 &&
      etatActuel.questionEnCours === 0
    ) {
      const idBrouillon = await creeBrouillonService(valeur as string);
      update((etatCourant) => ({
        ...etatCourant,
        idBrouillonExistant: idBrouillon,
      }));
    }

    update((etatCourant) => {
      let prochaineEtape = etatCourant.etapeEnCours;
      let prochaineQuestion = etatCourant.questionEnCours + 1;
      if (
        etatCourant.questionEnCours ===
        toutesEtapes[etatCourant.etapeEnCours].questions.length - 1
      ) {
        prochaineQuestion = 0;
        prochaineEtape += 1;
      }
      return {
        ...etatCourant,
        etapeEnCours: prochaineEtape,
        questionEnCours: prochaineQuestion,
      };
    });
  },
};

type EtapeCourante = {
  numero: number;
  numeroMax: number;
  titre: string;
  titreEtapeSuivante?: string;
  nombreQuestions: number;
  numeroQuestionCourante: number;
  questionCourante: QuestionAvecIdentifiantPropriete;
  estDerniereQuestion: boolean;
  estPremiereQuestion: boolean;
};

export const etapeCourante = derived<[typeof etapeStore], EtapeCourante>(
  [etapeStore],
  ([$etapeStore]) => {
    const { numero, titre, questions } = toutesEtapes[$etapeStore.etapeEnCours];
    return {
      numero,
      numeroMax: toutesEtapes.length,
      titre,
      titreEtapeSuivante: toutesEtapes[$etapeStore.etapeEnCours + 1]?.titre,
      numeroQuestionCourante: $etapeStore.questionEnCours + 1,
      nombreQuestions: questions.length,
      questionCourante: questions[$etapeStore.questionEnCours],
      estDerniereQuestion:
        $etapeStore.etapeEnCours === toutesEtapes.length - 1 &&
        $etapeStore.questionEnCours === questions.length - 1,
      estPremiereQuestion:
        $etapeStore.etapeEnCours === 0 && $etapeStore.questionEnCours === 0,
    };
  }
);
