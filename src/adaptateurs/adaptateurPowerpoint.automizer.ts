import { Automizer, ISlide, modify } from 'pptx-automizer';
import {
  AdaptateurPowerpoint,
  AutoriteHomologation,
  DonneesSupportCommissionHomologation,
} from './adaptateurPowerpoint.interface.js';
import { dateEnFrancais } from '../utilitaires/date.js';

const NOM_TEMPLATE = 'supportCommissionHomologation.pptx';
const MODELE = 'modele';
const SLIDE_COUVERTURE = 1;
const SLIDE_SOMMAIRE = 2;
const SLIDE_COMMISSION = 3;

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

const NOMBRE_LIGNES_PIECES_DU_TEMPLATE = 6;
const PAS_ENTRE_DEUX_LIGNES_DE_PIECES = 661987;

const ajouteLigneDePieceSousLeTemplate = (
  slide: ISlide,
  piece: string,
  rangSousLeTemplate: number
) => {
  const derniereLigne = `piece-${NOMBRE_LIGNES_PIECES_DU_TEMPLATE}`;
  const decalage = modify.updatePosition({
    y: PAS_ENTRE_DEUX_LIGNES_DE_PIECES * rangSousLeTemplate,
  });
  slide.addElement(MODELE, SLIDE_COMMISSION, `${derniereLigne}-case`, decalage);
  slide.addElement(MODELE, SLIDE_COMMISSION, `${derniereLigne}-texte`, [
    decalage,
    modify.setText(piece),
  ]);
  slide.addElement(
    MODELE,
    SLIDE_COMMISSION,
    `${derniereLigne}-separateur`,
    decalage
  );
};

const ecrisPiecesDuDossier = (slide: ISlide, pieces: string[]) => {
  pieces.forEach((piece, index) => {
    const numeroLigne = index + 1;
    if (numeroLigne <= NOMBRE_LIGNES_PIECES_DU_TEMPLATE) {
      slide.modifyElement(`piece-${numeroLigne}-texte`, modify.setText(piece));
    } else {
      ajouteLigneDePieceSousLeTemplate(
        slide,
        piece,
        numeroLigne - NOMBRE_LIGNES_PIECES_DU_TEMPLATE
      );
    }
  });
};

const retireLignesDePiecesInutilisees = (
  slide: ISlide,
  nombrePieces: number
) => {
  for (
    let numeroLigne = nombrePieces + 1;
    numeroLigne <= NOMBRE_LIGNES_PIECES_DU_TEMPLATE;
    numeroLigne += 1
  ) {
    ['case', 'texte', 'separateur'].forEach((partie) =>
      slide.removeElement(`piece-${numeroLigne}-${partie}`)
    );
  }
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
    presentation.addSlide(MODELE, SLIDE_COMMISSION, (slide) => {
      if (autorite) {
        remplisCelluleAutoriteRenseignee(slide, autorite);
        retireCelluleAutoriteACompleter(slide);
      } else {
        retireCelluleAutoriteRenseignee(slide);
      }
      ecrisPiecesDuDossier(slide, piecesDuDossier);
      retireLignesDePiecesInutilisees(slide, piecesDuDossier.length);
    });

    const archive = await presentation.getJSZip();
    return archive.generateAsync({ type: 'nodebuffer' });
  }
}
