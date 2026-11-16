import { Automizer, modify } from 'pptx-automizer';
import {
  MODELE,
  SLIDE_ANALYSE_DE_RISQUES_COMPLEMENTAIRE,
} from '../template.js';
import { NiveauSecurite } from '../../../../donneesReferentielMesuresV2.js';

const NIVEAU_BASIQUE: NiveauSecurite = 'niveau1';

export const ajouteLAnalyseDeRisquesComplementaire = (
  presentation: Automizer,
  idNiveau: NiveauSecurite
) => {
  presentation.addSlide(
    MODELE,
    SLIDE_ANALYSE_DE_RISQUES_COMPLEMENTAIRE,
    (slide) => {
      if (idNiveau === NIVEAU_BASIQUE) return;
      slide.modifyElement(
        'titre',
        modify.setText('Analyse de risques complémentaire')
      );
    }
  );
};
