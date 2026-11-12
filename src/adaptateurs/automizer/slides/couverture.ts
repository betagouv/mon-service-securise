import { Automizer, modify } from 'pptx-automizer';
import { MODELE, SLIDE_COUVERTURE } from '../template.js';
import { dateEnFrancais } from '../../../utilitaires/date.js';

export const ajouteLaCouverture = (
  presentation: Automizer,
  dateCreation: Date
) => {
  presentation.addSlide(MODELE, SLIDE_COUVERTURE, (slide) => {
    slide.modifyElement(
      'date-creation',
      modify.replaceText({
        replace: 'dateCreation',
        by: { text: dateEnFrancais(dateCreation) },
      })
    );
  });
};
