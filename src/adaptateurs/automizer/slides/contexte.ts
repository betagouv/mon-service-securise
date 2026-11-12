import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_CONTEXTE } from '../template.js';
import { ContexteDuService } from '../../../modeles/objetsPowerpoint/contexteDuService.js';
import {
  changeLaTailleDePolice,
  Police,
  policeQuiConvient,
  tientDansLaPolice,
  unParagrapheParLigne,
} from '../texte.js';

const POLICES_DE_LA_DESCRIPTION: Police[] = [
  { taille: 21, caracteresParLigne: 105, lignes: 2 },
  { taille: 16, caracteresParLigne: 120, lignes: 3 },
  { taille: 14, caracteresParLigne: 130, lignes: 4 },
];

const coupeLaDescription = (description: string, police: Police) => {
  if (tientDansLaPolice(description, police)) return description;
  const coupeA = (position: number) =>
    `${description.slice(0, position).trimEnd()}…`;
  const finsDeMots = [...description.matchAll(/\s/g)].map(({ index }) => index);
  const derniereFinGardee =
    finsDeMots.findLast((fin) => tientDansLaPolice(coupeA(fin), police)) ?? 0;
  return coupeA(derniereFinGardee);
};

const policeDeLaDescription = (description: string) =>
  policeQuiConvient(description, POLICES_DE_LA_DESCRIPTION);

const ecrisLaDescription = (slide: ISlide, description = '') => {
  const police = policeDeLaDescription(description);
  slide.modifyElement('contexte-description', [
    modify.setText(coupeLaDescription(description, police)),
    unParagrapheParLigne,
    changeLaTailleDePolice(police.taille),
  ]);
};

export const ajouteLeContexte = (
  presentation: Automizer,
  contexte: ContexteDuService
) => {
  presentation.addSlide(MODELE, SLIDE_CONTEXTE, (slide) => {
    ecrisLaDescription(slide, contexte.description);
    slide.modifyElement(
      'contexte-organisation',
      modify.setText(contexte.organisation)
    );
    slide.modifyElement('contexte-statut', modify.setText(contexte.statut));
    slide.modifyElement('contexte-urls', modify.setText(contexte.urls));
    slide.modifyElement(
      'contexte-type-de-projet',
      modify.setText(contexte.typeDeProjet)
    );
    slide.modifyElement(
      'contexte-hebergement',
      modify.setText(contexte.hebergement)
    );
    slide.modifyElement(
      'contexte-donnees-stockees',
      modify.setText(contexte.donneesStockees)
    );
    slide.modifyElement(
      'contexte-securisations',
      modify.setText(contexte.securisations)
    );
  });
};
