import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_AVIS_DES_MEMBRES } from '../template.js';
import { decoupeEnPagesALaHauteur } from '../pagination.js';
import { ecrisNumeroDePage } from '../formes.js';
import { AvisDUnMembre } from '../../../modeles/objetsPowerpoint/avisDesMembres.js';
import {
  changeLaTailleDePolice,
  nombreDeLignesALaLargeurEnArial,
  unParagrapheParLigne,
} from '../texte.js';

const NOMBRE_DE_CARTES_DU_MODELE = 4;
const PARTIES_D_UNE_CARTE = [
  'carte',
  'bandeau',
  'membres',
  'libelle-avis',
  'avis',
  'libelle-duree',
  'duree',
  'libelle-commentaire',
  'commentaire',
];
const FONDS_D_UNE_CARTE = ['carte', 'bandeau'];

type FormatDePage = { largeurDesCartes: number; xDesCartes: number[] };

const QUATRE_CARTES: FormatDePage = {
  largeurDesCartes: 3952875,
  xDesCartes: [838200, 5057775, 9277350, 13496925],
};
const DEUX_CARTES_LARGES: FormatDePage = {
  largeurDesCartes: 8172450,
  xDesCartes: [838200, 9277350],
};

const HAUT_DES_MEMBRES = 2718420;
const BAS_DES_CARTES = 2394570 + 6939930;
const MARGE_DANS_LA_CARTE = 266700;
const MARGES_INTERNES_D_UN_TEXTE = 2 * 25400;

const ECART_SOUS_UNE_VALEUR = 228600;
const ECART_SOUS_UN_LIBELLE = 38100;
const HAUTEUR_D_UN_LIBELLE = 300038;

type TexteDUneCarte = {
  tailleEnPoints: number;
  hauteurSurUneLigne: number;
  hauteurDUneLigneDePlus: number;
};

const MEMBRES: TexteDUneCarte = {
  tailleEnPoints: 22.5,
  hauteurSurUneLigne: 395288,
  hauteurDUneLigneDePlus: 355880,
};

const VALEUR: TexteDUneCarte = {
  tailleEnPoints: 18,
  hauteurSurUneLigne: 300038,
  hauteurDUneLigneDePlus: 261937,
};

const TAILLES_DU_COMMENTAIRE = [18, 16, 14];
const PLUS_PETITE_TAILLE_DU_COMMENTAIRE =
  TAILLES_DU_COMMENTAIRE[TAILLES_DU_COMMENTAIRE.length - 1];
const HAUTEUR_D_UNE_LIGNE_SIMPLE_PAR_POINT =
  VALEUR.hauteurDUneLigneDePlus / VALEUR.tailleEnPoints;
const INTERLIGNE_DU_COMMENTAIRE = 1.17818;

const largeurDesTextes = ({ largeurDesCartes }: FormatDePage) =>
  largeurDesCartes - 2 * MARGE_DANS_LA_CARTE;

const largeurUtileDesTextes = (format: FormatDePage) =>
  largeurDesTextes(format) - MARGES_INTERNES_D_UN_TEXTE;

const hauteurDuTexte = (
  texte: string,
  {
    tailleEnPoints,
    hauteurSurUneLigne,
    hauteurDUneLigneDePlus,
  }: TexteDUneCarte,
  format: FormatDePage
) =>
  hauteurSurUneLigne +
  (nombreDeLignesALaLargeurEnArial(
    texte,
    largeurUtileDesTextes(format),
    tailleEnPoints
  ) -
    1) *
    hauteurDUneLigneDePlus;

type PositionDUnTexte = { partie: string; y: number; h: number };

type DispositionDUneCarte = {
  positions: PositionDUnTexte[];
  hauteurDuCommentaire: number;
};

const empileLesTextes = (hauteurs: [string, number][]) =>
  hauteurs.reduce<PositionDUnTexte[]>((positions, [partie, h]) => {
    const precedent = positions[positions.length - 1];
    if (!precedent) return [{ partie, y: HAUT_DES_MEMBRES, h }];
    const ecart = precedent.partie.startsWith('libelle-')
      ? ECART_SOUS_UN_LIBELLE
      : ECART_SOUS_UNE_VALEUR;
    return [...positions, { partie, y: precedent.y + precedent.h + ecart, h }];
  }, []);

const disposeLaCarte = (
  { membres, avis, duree }: AvisDUnMembre,
  format: FormatDePage
): DispositionDUneCarte => {
  const textesAuDessusDuCommentaire = empileLesTextes([
    ['membres', hauteurDuTexte(membres, MEMBRES, format)],
    ['libelle-avis', HAUTEUR_D_UN_LIBELLE],
    ['avis', hauteurDuTexte(avis, VALEUR, format)],
    ['libelle-duree', HAUTEUR_D_UN_LIBELLE],
    ['duree', hauteurDuTexte(duree, VALEUR, format)],
    ['libelle-commentaire', HAUTEUR_D_UN_LIBELLE],
  ]);
  const libelleDuCommentaire =
    textesAuDessusDuCommentaire[textesAuDessusDuCommentaire.length - 1];
  const hautDuCommentaire =
    libelleDuCommentaire.y + libelleDuCommentaire.h + ECART_SOUS_UN_LIBELLE;
  const hauteurDuCommentaire =
    BAS_DES_CARTES - MARGE_DANS_LA_CARTE - hautDuCommentaire;
  return {
    positions: [
      ...textesAuDessusDuCommentaire,
      { partie: 'commentaire', y: hautDuCommentaire, h: hauteurDuCommentaire },
    ],
    hauteurDuCommentaire,
  };
};

const commentaireTientEnPolice = (
  commentaire: string,
  taille: number,
  hauteurDuCommentaire: number,
  format: FormatDePage
) =>
  nombreDeLignesALaLargeurEnArial(
    commentaire,
    largeurUtileDesTextes(format),
    taille
  ) *
    taille *
    HAUTEUR_D_UNE_LIGNE_SIMPLE_PAR_POINT *
    INTERLIGNE_DU_COMMENTAIRE <=
  hauteurDuCommentaire - MARGES_INTERNES_D_UN_TEXTE;

const tailleDuCommentaire = (
  commentaire: string,
  hauteurDuCommentaire: number,
  format: FormatDePage
) =>
  TAILLES_DU_COMMENTAIRE.find((taille) =>
    commentaireTientEnPolice(commentaire, taille, hauteurDuCommentaire, format)
  ) ?? PLUS_PETITE_TAILLE_DU_COMMENTAIRE;

const tientDansUneCarteDuModele = (avis: AvisDUnMembre) =>
  commentaireTientEnPolice(
    avis.commentaire,
    PLUS_PETITE_TAILLE_DU_COMMENTAIRE,
    disposeLaCarte(avis, QUATRE_CARTES).hauteurDuCommentaire,
    QUATRE_CARTES
  );

const formatDeLaPage = (avisDeLaPage: AvisDUnMembre[]) =>
  avisDeLaPage.every(tientDansUneCarteDuModele)
    ? QUATRE_CARTES
    : DEUX_CARTES_LARGES;

const tiennentSurLaPage = (avisDeLaPage: AvisDUnMembre[]) =>
  avisDeLaPage.length <= formatDeLaPage(avisDeLaPage).xDesCartes.length;

const placeLaCarte = (
  slide: ISlide,
  forme: (partie: string) => string,
  x: number,
  format: FormatDePage,
  { positions }: DispositionDUneCarte
) => {
  FONDS_D_UNE_CARTE.forEach((partie) =>
    slide.modifyElement(
      forme(partie),
      modify.setPosition({ x, w: format.largeurDesCartes })
    )
  );
  positions.forEach(({ partie, y, h }) =>
    slide.modifyElement(
      forme(partie),
      modify.setPosition({
        x: x + MARGE_DANS_LA_CARTE,
        y,
        w: largeurDesTextes(format),
        h,
      })
    )
  );
};

const ecrisLaCarte = (
  slide: ISlide,
  forme: (partie: string) => string,
  { membres, avis, duree, commentaire }: AvisDUnMembre,
  format: FormatDePage,
  { hauteurDuCommentaire }: DispositionDUneCarte
) => {
  slide.modifyElement(forme('membres'), modify.setText(membres));
  slide.modifyElement(forme('avis'), modify.setText(avis));
  slide.modifyElement(forme('duree'), modify.setText(duree));
  slide.modifyElement(forme('commentaire'), [
    modify.setText(commentaire),
    unParagrapheParLigne,
    changeLaTailleDePolice(
      tailleDuCommentaire(commentaire, hauteurDuCommentaire, format)
    ),
  ]);
};

const ecrisLesCartes = (slide: ISlide, avisDeLaPage: AvisDUnMembre[]) => {
  const format = formatDeLaPage(avisDeLaPage);
  Array.from(
    { length: NOMBRE_DE_CARTES_DU_MODELE },
    (_, index) => index + 1
  ).forEach((numeroCarte) => {
    const avis = avisDeLaPage[numeroCarte - 1];
    const x = format.xDesCartes[numeroCarte - 1];
    const forme = (partie: string) => `avis-${numeroCarte}-${partie}`;
    if (!avis || x === undefined) {
      PARTIES_D_UNE_CARTE.forEach((partie) =>
        slide.removeElement(forme(partie))
      );
      return;
    }
    const disposition = disposeLaCarte(avis, format);
    placeLaCarte(slide, forme, x, format, disposition);
    ecrisLaCarte(slide, forme, avis, format, disposition);
  });
};

export const ajouteLesAvisDesMembres = (
  presentation: Automizer,
  avisDesMembres: AvisDUnMembre[]
) => {
  const pages = decoupeEnPagesALaHauteur(avisDesMembres, tiennentSurLaPage);
  pages.forEach((avisDeLaPage, index) =>
    presentation.addSlide(MODELE, SLIDE_AVIS_DES_MEMBRES, (slide) => {
      ecrisNumeroDePage(slide, 'avis-titre', index + 1, pages.length);
      if (avisDesMembres.length > 0) slide.removeElement('aucun-avis');
      ecrisLesCartes(slide, avisDeLaPage);
    })
  );
};
