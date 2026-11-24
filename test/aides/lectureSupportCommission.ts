import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import {
  cadreDeLaForme,
  nomsDesFormes,
  texteDeLaForme,
  textesDeLaSlide,
} from './lecturePptx.js';

const CHEMIN_DU_MODELE =
  'src/vuesPowerpoint/supportCommissionHomologation.pptx';

export const slideDuModele = async (numero: number) => {
  const modele = await JSZip.loadAsync(await readFile(CHEMIN_DU_MODELE));
  return modele.file(`ppt/slides/slide${numero}.xml`)!.async('string');
};

export const slidesAvecLaForme = (slides: string[], nom: string) =>
  slides.filter((slide) => nomsDesFormes(slide).includes(nom));

export const slideAvecLaForme = (slides: string[], nom: string) => {
  const [slide] = slidesAvecLaForme(slides, nom);
  if (!slide) throw new Error(`Aucune slide ne contient la forme ${nom}`);
  return slide;
};

export const positionDeLaSlideAvecLaForme = (slides: string[], nom: string) =>
  slides.indexOf(slideAvecLaForme(slides, nom)) + 1;

export const slideAvecUnTexteCommencantPar = (
  slides: string[],
  debut: string
) => {
  const slide = slides.find((candidate) =>
    textesDeLaSlide(candidate).some((texte) => texte.startsWith(debut))
  );
  if (!slide) throw new Error(`Aucune slide ne contient le texte ${debut}`);
  return slide;
};

const textesDesFormesNumerotees = (page: string, motif: RegExp) =>
  nomsDesFormes(page)
    .filter((nom) => motif.test(nom))
    .map((nom) => texteDeLaForme(page, nom));

export const pagesDesPieces = (slides: string[]) =>
  slidesAvecLaForme(slides, 'titre-page-pieces');

export const titreDeLaPageDesPieces = (page: string) =>
  texteDeLaForme(page, 'titre-page-pieces');

export const nomDeLaLigneDePiece = (numero: number, partie: string) =>
  `piece-${numero}-${partie}`;

export const texteDeLaLigneDePiece = (
  page: string,
  numero: number,
  partie: string
) => texteDeLaForme(page, nomDeLaLigneDePiece(numero, partie));

export const DESCRIPTION_DU_CONTEXTE = 'contexte-description';

export const slideDuContexte = (slides: string[]) =>
  slideAvecLaForme(slides, DESCRIPTION_DU_CONTEXTE);

export const slideDesBesoins = (slides: string[]) =>
  slideAvecLaForme(slides, 'besoins-niveau');

export const nomsDesPastilles = (besoins: string) =>
  nomsDesFormes(besoins).filter((nom) => /^donnee-identifiee-\d+$/.test(nom));

export const pastillesDesDonnees = (besoins: string) =>
  nomsDesPastilles(besoins).map((nom) => cadreDeLaForme(besoins, nom));

export const pagesDeLaCartographie = (slides: string[], titre: string) =>
  slidesAvecLaForme(slides, 'liste-risques-total').filter((slide) =>
    texteDeLaForme(slide, 'cartographie-titre').startsWith(titre)
  );

export const identifiantsDesRisques = (page: string) =>
  textesDesFormesNumerotees(page, /^risque-\d+-identifiant$/);

export const pagesDeLaDescriptionDesRisques = (slides: string[]) =>
  slidesAvecLaForme(slides, 'description-risques-total');

export const identifiantsDeLaDescriptionDesRisques = (page: string) =>
  textesDesFormesNumerotees(page, /^description-risque-\d+-identifiant$/);

export const slideDeLIndiceCyber = (slides: string[]) =>
  slideAvecLaForme(slides, 'indice-cyber-texte');

export const slideDesStatistiques = (slides: string[]) =>
  slideAvecLaForme(slides, 'mesures-total');

export const pagesDesExigences = (slides: string[]) =>
  slidesAvecLaForme(slides, 'exigences-restantes-titre');

export const descriptionsDesExigences = (page: string) =>
  textesDesFormesNumerotees(page, /^exigence-\d+-description$/);

export const pagesDesAvis = (slides: string[]) =>
  slidesAvecLaForme(slides, 'avis-titre');

export const membresDesAvis = (page: string) =>
  textesDesFormesNumerotees(page, /^avis-\d-membres$/);

export const slidesDeLAnnexe = (slides: string[]) =>
  slidesAvecLaForme(slides, 'annexe-statut-texte');

export const descriptionsDesMesures = (page: string) =>
  textesDesFormesNumerotees(page, /^mesure-\d-mesure$/);
