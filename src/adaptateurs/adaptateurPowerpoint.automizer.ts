import { Automizer, ISlide, modify } from 'pptx-automizer';
import {
  AdaptateurPowerpoint,
  AutoriteHomologation,
  DonneesSupportCommissionHomologation,
} from './adaptateurPowerpoint.interface.js';
import { dateEnFrancais } from '../utilitaires/date.js';

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

const ecrisPiecesDuDossier = (slide: ISlide, pieces: string[]) => {
  pieces.forEach((piece, index) => {
    slide.modifyElement(`piece-${index + 1}-texte`, modify.setText(piece));
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

const NOM_TEMPLATE = 'supportCommissionHomologation.pptx';
const SLIDE_COUVERTURE = 1;
const SLIDE_SOMMAIRE = 2;
const SLIDE_COMMISSION = 3;

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
      .load(NOM_TEMPLATE, 'modele');

    presentation.addSlide('modele', SLIDE_COUVERTURE, (slide) => {
      slide.modifyElement(
        'date-creation',
        modify.replaceText({
          replace: 'dateCreation',
          by: { text: dateEnFrancais(dateCreation) },
        })
      );
    });
    presentation.addSlide('modele', SLIDE_SOMMAIRE);
    presentation.addSlide('modele', SLIDE_COMMISSION, (slide) => {
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
