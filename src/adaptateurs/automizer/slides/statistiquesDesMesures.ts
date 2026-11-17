import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_STATISTIQUES_DES_MESURES } from '../template.js';
import {
  RepartitionParStatut,
  StatistiquesDesMesures,
} from '../../../modeles/objetsPowerpoint/statistiquesDesMesures.js';
import { STATUTS } from '../../../modeles/mesure.js';
import { auPluriel } from '../texte.js';

const CRITICITES = ['indispensables', 'recommandees'] as const;
const BARRE_D_UNE_CRITICITE = { x: 1219200, largeur: 7353300 };

const nombreDeMesures = (repartition: RepartitionParStatut) =>
  Object.values(repartition).reduce((somme, nombre) => somme + nombre, 0);

const ecrisLesSegments = (
  slide: ISlide,
  prefixe: string,
  repartition: RepartitionParStatut,
  barre: { x: number; largeur: number }
) => {
  const total = nombreDeMesures(repartition);
  STATUTS.reduce((x, statut) => {
    const segment = `${prefixe}-${statut}`;
    const nombre = repartition[statut];
    if (nombre === 0) {
      slide.removeElement(segment);
      return x;
    }
    const largeur = Math.round((barre.largeur * nombre) / total);
    slide.modifyElement(segment, modify.setPosition({ x, w: largeur }));
    return x + largeur;
  }, barre.x);
};

const BARRE_D_UNE_CATEGORIE = { x: 12039600, largeur: 4038600 };

const NOMBRE_DE_LIGNES_DE_CATEGORIE = 4;
const PARTIES_D_UNE_LIGNE_DE_CATEGORIE = [
  'libelle',
  'barre',
  ...STATUTS,
  'total',
];

const ecrisLesCategories = (
  slide: ISlide,
  parCategorie: StatistiquesDesMesures['parCategorie']
) => {
  Array.from(
    { length: NOMBRE_DE_LIGNES_DE_CATEGORIE },
    (_, index) => index + 1
  ).forEach((numeroLigne) => {
    const prefixe = `categorie-${numeroLigne}`;
    const categorie = parCategorie[numeroLigne - 1];
    if (!categorie) {
      PARTIES_D_UNE_LIGNE_DE_CATEGORIE.forEach((partie) =>
        slide.removeElement(`${prefixe}-${partie}`)
      );
      return;
    }
    const { libelle, total, ...repartition } = categorie;
    slide.modifyElement(`${prefixe}-libelle`, modify.setText(libelle));
    slide.modifyElement(`${prefixe}-total`, modify.setText(String(total)));
    ecrisLesSegments(slide, prefixe, repartition, BARRE_D_UNE_CATEGORIE);
  });
};

const ecrisLesCriticites = (
  slide: ISlide,
  parCriticite: StatistiquesDesMesures['parCriticite']
) => {
  CRITICITES.forEach((criticite) => {
    const { restant, ...repartition } = parCriticite[criticite];
    ecrisLesSegments(
      slide,
      `criticite-${criticite}`,
      repartition,
      BARRE_D_UNE_CRITICITE
    );
    slide.modifyElement(
      `criticite-${criticite}-restant`,
      modify.replaceText({
        replace: 'restant',
        by: { text: `${restant} ${auPluriel(restant, 'mesure', 'mesures')}` },
      })
    );
  });
};

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
    ecrisLesCriticites(slide, statistiques.parCriticite);
    ecrisLesCategories(slide, statistiques.parCategorie);
  });
};
