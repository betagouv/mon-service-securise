import { Automizer, modify } from 'pptx-automizer';
import { MODELE, SLIDE_STATISTIQUES_DES_MESURES } from '../template.js';
import { StatistiquesDesMesures } from '../../../modeles/objetsPowerpoint/statistiquesDesMesures.js';

const auPluriel = (nombre: number, singulier: string, pluriel: string) =>
  nombre > 1 ? pluriel : singulier;

export const ajouteLesStatistiquesDesMesures = (
  presentation: Automizer,
  statistiques: StatistiquesDesMesures
) => {
  const { nombreDeMesuresGenerales, nombreDeMesuresSpecifiques, referentiels } =
    statistiques;
  presentation.addSlide(MODELE, SLIDE_STATISTIQUES_DES_MESURES, (slide) => {
    slide.modifyElement(
      'mesures-total',
      modify.replaceText([
        {
          replace: 'nombreDeMesuresGenerales',
          by: { text: String(nombreDeMesuresGenerales) },
        },
        {
          replace: 'mesuresProposees',
          by: {
            text: auPluriel(
              nombreDeMesuresGenerales,
              'mesure proposée',
              'mesures proposées'
            ),
          },
        },
        { replace: 'referentiels', by: { text: referentiels } },
        {
          replace: 'nombreDeMesuresSpecifiques',
          by: { text: String(nombreDeMesuresSpecifiques) },
        },
        {
          replace: 'ajoutees',
          by: {
            text: auPluriel(nombreDeMesuresSpecifiques, 'ajoutée', 'ajoutées'),
          },
        },
      ])
    );
  });
};
