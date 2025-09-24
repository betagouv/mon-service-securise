import { derived } from 'svelte/store';
import { navigationStore } from './navigation.store';
import {
  type EtapeGlobale,
  type QuestionBindeeSurBrouillon,
  toutesEtapes,
} from './toutesEtapes';

type EtapeCourante = {
  numero: number;
  numeroMax: number;
  titre: string;
  titreEtapeSuivante?: string;
  nombreQuestions: number;
  numeroQuestionCourante: number;
  questionCourante: QuestionBindeeSurBrouillon | EtapeGlobale;
  estDerniereQuestion: boolean;
  estPremiereQuestion: boolean;
  illustration?: string;
};

export const etapeCourante = derived<[typeof navigationStore], EtapeCourante>(
  [navigationStore],
  ([$navigation]) => {
    const { numero, titre, questions, illustration } =
      toutesEtapes[$navigation.etapeEnCours];

    return {
      numero,
      numeroMax: toutesEtapes.length,
      titre,
      illustration,
      titreEtapeSuivante: toutesEtapes[$navigation.etapeEnCours + 1]?.titre,
      numeroQuestionCourante: $navigation.questionEnCours + 1,
      nombreQuestions: questions.length,
      questionCourante: questions[$navigation.questionEnCours],
      estDerniereQuestion:
        $navigation.etapeEnCours === toutesEtapes.length - 1 &&
        $navigation.questionEnCours === questions.length - 1,
      estPremiereQuestion:
        $navigation.etapeEnCours === 0 && $navigation.questionEnCours === 0,
    };
  }
);
