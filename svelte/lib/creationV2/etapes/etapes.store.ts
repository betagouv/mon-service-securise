import { derived, get, writable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';
import type { UUID } from '../../typesBasiquesSvelte';
import {
  creeBrouillonService,
  finaliseBrouillonService,
} from '../creationV2.api';
import type { Brouillon } from '../creationV2.d';
import { ajouteParametreAUrl } from '../../outils/url';
import QuestionNomService from './etape1/QuestionNomService.svelte';
import QuestionSiret from './etape1/QuestionSiret.svelte';
import QuestionStatutDeploiement from './etape1/QuestionStatutDeploiement.svelte';

type QuestionProps = {
  estComplete: boolean;
  valeur: string | number;
};

type ComposantQuestion = typeof SvelteComponent<QuestionProps>;

type QuestionAvecIdentifiantPropriete = {
  clePropriete: keyof Brouillon;
  composant: ComposantQuestion;
  explications: string[];
};

type PropsEtape = {
  numero: number;
  titre: string;
  questions: QuestionAvecIdentifiantPropriete[];
  illustration: string;
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
    illustration: '/statique/assets/images/illustration_accueil_connexion.svg',
    questions: [
      {
        clePropriete: 'nomService',
        composant: QuestionNomService,
        explications: [
          'Dans tout projet d’homologation, il est primordial d’identifier le périmètre sur lequel les travaux vont être menés.',
          'Le choix du périmètre dépend de la nature des données traitées et de sa complexité.',
          'Le périmètre du système d’information à homologuer est l’ensemble des composants du système d’information dans lequel l’information est traitée et pour lequel une autorité a été identifiée',
        ],
      },
      {
        clePropriete: 'siret',
        composant: QuestionSiret,
        explications: [
          "Ces informations permettent de donner de la visibilité sur l'homologation au top-management de votre entité.",
        ],
      },
      {
        clePropriete: 'statutDeploiement',
        composant: QuestionStatutDeploiement,
        explications: [
          "Ces informations permettent de juger de l'adhérence du processus d'homologation au sein de votre entité. ",
          'En effet, ce processus doit normalement démarrer lorsque le service est encore en conception, et non pas en production.',
          "Cela permet notamment d'éviter des coûts importants de correction.",
        ],
      },
    ],
  },
  {
    numero: 2,
    titre: 'Caractéristiques du service',
    illustration: '/statique/assets/images/home/illustration_etape_2.svg',
    questions: [],
  },
];

export const toutesClesPropriete = toutesEtapes.flatMap((e) =>
  e.questions.flatMap((q) => q.clePropriete)
);

const { subscribe, update } = writable<EtatFormulaireCreation>({
  etapeEnCours: 0,
  questionEnCours: 0,
});

export const enCoursDeChargement = writable(false);

export const etapeStore = {
  rechargeBrouillon: (id: UUID, donneesBrouillon: Brouillon) => {
    let questionPrecedente: { etape: number; question: number } = {
      etape: 0,
      question: 0,
    };
    let cibleTrouvee = false;
    for (let e = 0; e < toutesEtapes.length; e++) {
      const etape = toutesEtapes[e];
      for (let q = 0; q < etape.questions.length; q++) {
        const question = etape.questions[q];
        if (donneesBrouillon[question.clePropriete] === undefined) {
          cibleTrouvee = true;
          break;
        }
        questionPrecedente = { etape: e, question: q };
      }
      if (cibleTrouvee) break;
    }
    update(() => ({
      idBrouillonExistant: id,
      etapeEnCours: questionPrecedente.etape,
      questionEnCours: questionPrecedente.question,
    }));
  },
  finalise: async () => {
    enCoursDeChargement.set(true);
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
      ajouteParametreAUrl('id', idBrouillon);
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
  illustration: string;
};

export const etapeCourante = derived<[typeof etapeStore], EtapeCourante>(
  [etapeStore],
  ([$etapeStore]) => {
    const { numero, titre, questions, illustration } =
      toutesEtapes[$etapeStore.etapeEnCours];
    return {
      numero,
      numeroMax: toutesEtapes.length,
      titre,
      illustration,
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
