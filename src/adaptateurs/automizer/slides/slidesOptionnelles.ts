import { Automizer, modify } from 'pptx-automizer';
import {
  MODELE,
  SLIDE_ANALYSE_DE_RISQUES_COMPLEMENTAIRE,
  SLIDE_PLAN_D_ACTION,
} from '../template.js';
import { NiveauSecurite } from '../../../../donneesReferentielMesuresV2.js';

const NIVEAU_BASIQUE: NiveauSecurite = 'niveau1';

const ajouteUneSlideOptionnelleEnNiveauBasique =
  (numeroDeSlide: number, titreSansOptionnel: string) =>
  (presentation: Automizer, idNiveau: NiveauSecurite) => {
    presentation.addSlide(MODELE, numeroDeSlide, (slide) => {
      if (idNiveau === NIVEAU_BASIQUE) return;
      slide.modifyElement('titre', modify.setText(titreSansOptionnel));
    });
  };

export const ajouteLAnalyseDeRisquesComplementaire =
  ajouteUneSlideOptionnelleEnNiveauBasique(
    SLIDE_ANALYSE_DE_RISQUES_COMPLEMENTAIRE,
    'Analyse de risques complémentaire'
  );

export const ajouteLePlanDAction = ajouteUneSlideOptionnelleEnNiveauBasique(
  SLIDE_PLAN_D_ACTION,
  'Plan d’action'
);
