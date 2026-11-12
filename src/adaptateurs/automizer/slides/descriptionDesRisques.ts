import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_DESCRIPTION_DES_RISQUES } from '../template.js';
import { RisqueCartographie } from '../../../modeles/objetsPowerpoint/cartographiesDesRisques.js';

const NOMBRE_DE_LIGNES_DE_LA_DESCRIPTION_DES_RISQUES = 7;
const PARTIES_D_UNE_LIGNE_DE_DESCRIPTION = [
  'fond-reference',
  'pastille',
  'identifiant',
  'fond-intitule',
  'intitule',
  'fond-description',
  'description',
];

const nombreDeRisques = (nombre: number) =>
  nombre > 1 ? `${nombre} risques` : `${nombre} risque`;

const ecrisLesLignes = (slide: ISlide, risques: RisqueCartographie[]) => {
  Array.from(
    { length: NOMBRE_DE_LIGNES_DE_LA_DESCRIPTION_DES_RISQUES },
    (_, index) => index + 1
  ).forEach((numeroLigne) => {
    const risque = risques[numeroLigne - 1];
    const forme = (partie: string) =>
      `description-risque-${numeroLigne}-${partie}`;
    if (!risque) {
      PARTIES_D_UNE_LIGNE_DE_DESCRIPTION.forEach((partie) =>
        slide.removeElement(forme(partie))
      );
      return;
    }
    slide.modifyElement(
      forme('identifiant'),
      modify.setText(risque.identifiant)
    );
    slide.modifyElement(forme('intitule'), modify.setText(risque.intitule));
    slide.modifyElement(
      forme('description'),
      modify.setText(risque.description)
    );
  });
};

export const ajouteLaDescriptionDesRisques = (
  presentation: Automizer,
  risques: RisqueCartographie[]
) => {
  presentation.addSlide(MODELE, SLIDE_DESCRIPTION_DES_RISQUES, (slide) => {
    slide.modifyElement(
      'description-risques-total',
      modify.setText(nombreDeRisques(risques.length))
    );
    ecrisLesLignes(slide, risques);
  });
};
