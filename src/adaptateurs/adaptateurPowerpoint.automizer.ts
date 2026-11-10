import { Automizer, ISlide, modify } from 'pptx-automizer';
import {
  AdaptateurPowerpoint,
  AutoriteHomologation,
  DonneesSupportCommissionHomologation,
} from './adaptateurPowerpoint.interface.js';
import { dateEnFrancais } from '../utilitaires/date.js';
import { PieceDuDossier } from '../modeles/objetsPowerpoint/piecesDuDossier.js';

const NOM_TEMPLATE = 'supportCommissionHomologation.pptx';
const MODELE = 'modele';
const SLIDE_COUVERTURE = 1;
const SLIDE_SOMMAIRE = 2;
const SLIDE_MEMBRES_COMMISSION = 30;
const SLIDE_PAGE_PIECES = 32;
const SLIDE_PAGE_PIECES_VIDE = 31;

const FORMES_AUTORITE_A_COMPLETER = [
  'autorite-homologation-a-completer-fond',
  'autorite-homologation-a-completer-trait',
  'autorite-homologation-a-completer-texte',
];

const remplisCelluleAutoriteRenseignee = (
  slide: ISlide,
  autorite: AutoriteHomologation
) => {
  slide.modifyElement(
    'autorite-homologation',
    modify.setText(`${autorite.nom}, ${autorite.fonction}`)
  );
};

const retireCelluleAutoriteRenseignee = (slide: ISlide) => {
  slide.removeElement('autorite-homologation');
};

const retireCelluleAutoriteACompleter = (slide: ISlide) => {
  FORMES_AUTORITE_A_COMPLETER.forEach((forme) => slide.removeElement(forme));
};

const ecrisAutoriteHomologation = (
  slide: ISlide,
  autorite: AutoriteHomologation | undefined
) => {
  if (autorite) {
    remplisCelluleAutoriteRenseignee(slide, autorite);
    retireCelluleAutoriteACompleter(slide);
  } else {
    retireCelluleAutoriteRenseignee(slide);
  }
};

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

const nombreDeLignesDeTexte = (texte: string) =>
  texte.split(' ').reduce(
    ({ lignes, longueurLigneCourante }, mot) => {
      const longueurAvecLeMot =
        longueurLigneCourante === 0
          ? mot.length
          : longueurLigneCourante + 1 + mot.length;
      return longueurAvecLeMot > CARACTERES_PAR_LIGNE_D_INTITULE
        ? { lignes: lignes + 1, longueurLigneCourante: mot.length }
        : { lignes, longueurLigneCourante: longueurAvecLeMot };
    },
    { lignes: 1, longueurLigneCourante: 0 }
  ).lignes;

const intituleAEcrire = (piece: PieceDuDossier) => {
  if (!piece.intituleAbrege)
    return { intitule: piece.intitule, lignesDeTexte: 1 };
  const lignesDeTexte = nombreDeLignesDeTexte(piece.intitule);
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

const ecrisNumeroDePage = (
  slide: ISlide,
  numeroPage: number,
  nombrePages: number
) => {
  const numerotation = nombrePages > 1 ? ` ${numeroPage}/${nombrePages}` : '';
  slide.modifyElement(
    'titre-page-pieces',
    modify.replaceText({ replace: 'pagination', by: { text: numerotation } })
  );
};

export class AdaptateurPowerpointAutomizer implements AdaptateurPowerpoint {
  constructor(private readonly dossierTemplates = 'src/vuesPowerpoint') {}

  async genereSupportCommissionHomologation({
    dateCreation,
    autorite,
    piecesDuDossier,
  }: DonneesSupportCommissionHomologation) {
    const presentation = new Automizer({
      templateDir: this.dossierTemplates,
      removeExistingSlides: true,
      autoImportSlideMasters: false,
      cleanup: true,
    })
      .loadRoot(NOM_TEMPLATE)
      .load(NOM_TEMPLATE, MODELE);

    presentation.addSlide(MODELE, SLIDE_COUVERTURE, (slide) => {
      slide.modifyElement(
        'date-creation',
        modify.replaceText({
          replace: 'dateCreation',
          by: { text: dateEnFrancais(dateCreation) },
        })
      );
    });
    presentation.addSlide(MODELE, SLIDE_SOMMAIRE);
    presentation.addSlide(MODELE, SLIDE_MEMBRES_COMMISSION, (slide) => {
      ecrisAutoriteHomologation(slide, autorite);
    });
    const pages = decoupeEnPages(piecesDuDossier);
    const avecPageVide = laDernierePageEstPleine(piecesDuDossier);
    const nombrePages = pages.length + (avecPageVide ? 1 : 0);
    pages.forEach((piecesDeLaPage, index) => {
      presentation.addSlide(MODELE, SLIDE_PAGE_PIECES, (slide) => {
        ecrisNumeroDePage(slide, index + 1, nombrePages);
        ecrisPiecesDuDossier(slide, piecesDeLaPage);
      });
    });
    if (avecPageVide) {
      presentation.addSlide(MODELE, SLIDE_PAGE_PIECES_VIDE, (slide) => {
        ecrisNumeroDePage(slide, nombrePages, nombrePages);
      });
    }

    const archive = await presentation.getJSZip();
    return archive.generateAsync({ type: 'nodebuffer' });
  }
}
