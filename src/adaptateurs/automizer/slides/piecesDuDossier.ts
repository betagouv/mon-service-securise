import { Automizer, ISlide, modify } from 'pptx-automizer';
import {
  MODELE,
  SLIDE_PAGE_PIECES,
  SLIDE_PAGE_PIECES_VIDE,
} from '../template.js';
import { PieceDuDossier } from '../../../modeles/objetsPowerpoint/piecesDuDossier.js';
import { nombreDeLignesDeTexte } from '../texte.js';
import { ecrisNumeroDePage } from '../formes.js';

const NOMBRE_LIGNES_PAR_PAGE_DE_PIECES = 16;
const PARTIES_LIGNE_A_COMPLETER = [
  'intitule-fond',
  'intitule-trait',
  'intitule-texte',
  'reference-fond',
  'reference-trait',
  'reference-texte',
];

const LIGNES_PAR_COLONNE = 8;
const CARACTERES_PAR_LIGNE_D_INTITULE = 40;
const LIGNES_DE_TEXTE_MAX_D_UN_INTITULE = 3;
const PAS_D_UNE_LIGNE_DE_TEXTE = 257175;
const HAUTEUR_D_UNE_LIGNE_DE_TEXTE = 285750;
const FORMES_LIGNE_REMPLIE = ['case', 'intitule', 'source', 'separateur'];
const FORMES_LIGNE_A_COMPLETER = [
  'case',
  ...PARTIES_LIGNE_A_COMPLETER.map((partie) => `a-completer-${partie}`),
  'separateur',
];

const intituleAEcrire = (piece: PieceDuDossier) => {
  if (!piece.intituleAbrege)
    return { intitule: piece.intitule, lignesDeTexte: 1 };
  const lignesDeTexte = nombreDeLignesDeTexte(
    piece.intitule,
    CARACTERES_PAR_LIGNE_D_INTITULE
  );
  return lignesDeTexte > LIGNES_DE_TEXTE_MAX_D_UN_INTITULE
    ? { intitule: piece.intituleAbrege, lignesDeTexte: 1 }
    : { intitule: piece.intitule, lignesDeTexte };
};

const remplisLigneAvecLaPiece = (
  slide: ISlide,
  numeroLigne: number,
  piece: PieceDuDossier,
  intitule: string
) => {
  slide.modifyElement(
    `piece-${numeroLigne}-case`,
    modify.setText(piece.cochee ? '☑' : '☐')
  );
  slide.modifyElement(
    `piece-${numeroLigne}-intitule`,
    modify.setText(intitule)
  );
  slide.modifyElement(
    `piece-${numeroLigne}-source`,
    modify.setText(piece.source)
  );
  PARTIES_LIGNE_A_COMPLETER.forEach((partie) =>
    slide.removeElement(`piece-${numeroLigne}-a-completer-${partie}`)
  );
};

const laisseLigneACompleter = (slide: ISlide, numeroLigne: number) => {
  slide.modifyElement(`piece-${numeroLigne}-case`, modify.setText('☐'));
  slide.removeElement(`piece-${numeroLigne}-intitule`);
  slide.removeElement(`piece-${numeroLigne}-source`);
};

const descendsLaLigne = (
  slide: ISlide,
  numeroLigne: number,
  formes: string[],
  decalage: number
) => {
  formes.forEach((forme) =>
    slide.modifyElement(
      `piece-${numeroLigne}-${forme}`,
      modify.updatePosition({ y: decalage })
    )
  );
};

const agrandisLaLigne = (
  slide: ISlide,
  numeroLigne: number,
  lignesDeTexteSupplementaires: number
) => {
  const agrandissement =
    lignesDeTexteSupplementaires * PAS_D_UNE_LIGNE_DE_TEXTE;
  slide.modifyElement(
    `piece-${numeroLigne}-intitule`,
    modify.updatePosition({
      h: lignesDeTexteSupplementaires * HAUTEUR_D_UNE_LIGNE_DE_TEXTE,
    })
  );
  ['case', 'source'].forEach((forme) =>
    slide.modifyElement(
      `piece-${numeroLigne}-${forme}`,
      modify.updatePosition({ y: agrandissement / 2 })
    )
  );
  slide.modifyElement(
    `piece-${numeroLigne}-separateur`,
    modify.updatePosition({ y: agrandissement })
  );
  return agrandissement;
};

const ecrisPiecesDuDossier = (slide: ISlide, pieces: PieceDuDossier[]) => {
  let decalageDansLaColonne = 0;
  for (
    let numeroLigne = 1;
    numeroLigne <= NOMBRE_LIGNES_PAR_PAGE_DE_PIECES;
    numeroLigne += 1
  ) {
    if (numeroLigne === LIGNES_PAR_COLONNE + 1) decalageDansLaColonne = 0;
    const piece = pieces[numeroLigne - 1];
    const formes = piece ? FORMES_LIGNE_REMPLIE : FORMES_LIGNE_A_COMPLETER;
    if (decalageDansLaColonne > 0) {
      descendsLaLigne(slide, numeroLigne, formes, decalageDansLaColonne);
    }
    if (piece) {
      const { intitule, lignesDeTexte } = intituleAEcrire(piece);
      remplisLigneAvecLaPiece(slide, numeroLigne, piece, intitule);
      if (lignesDeTexte > 1) {
        decalageDansLaColonne += agrandisLaLigne(
          slide,
          numeroLigne,
          lignesDeTexte - 1
        );
      }
    } else {
      laisseLigneACompleter(slide, numeroLigne);
    }
  }
};

const decoupeEnPages = (pieces: PieceDuDossier[]) => {
  const nombrePages = Math.max(
    1,
    Math.ceil(pieces.length / NOMBRE_LIGNES_PAR_PAGE_DE_PIECES)
  );
  return Array.from({ length: nombrePages }, (_, index) =>
    pieces.slice(
      index * NOMBRE_LIGNES_PAR_PAGE_DE_PIECES,
      (index + 1) * NOMBRE_LIGNES_PAR_PAGE_DE_PIECES
    )
  );
};

const laDernierePageEstPleine = (pieces: PieceDuDossier[]) =>
  pieces.length > 0 && pieces.length % NOMBRE_LIGNES_PAR_PAGE_DE_PIECES === 0;

export const ajouteLesPiecesDuDossier = (
  presentation: Automizer,
  piecesDuDossier: PieceDuDossier[]
) => {
  const pages = decoupeEnPages(piecesDuDossier);
  const avecPageVide = laDernierePageEstPleine(piecesDuDossier);
  const nombrePages = pages.length + (avecPageVide ? 1 : 0);
  pages.forEach((piecesDeLaPage, index) => {
    presentation.addSlide(MODELE, SLIDE_PAGE_PIECES, (slide) => {
      ecrisNumeroDePage(slide, 'titre-page-pieces', index + 1, nombrePages);
      ecrisPiecesDuDossier(slide, piecesDeLaPage);
    });
  });
  if (avecPageVide) {
    presentation.addSlide(MODELE, SLIDE_PAGE_PIECES_VIDE, (slide) => {
      ecrisNumeroDePage(slide, 'titre-page-pieces', nombrePages, nombrePages);
    });
  }
};
