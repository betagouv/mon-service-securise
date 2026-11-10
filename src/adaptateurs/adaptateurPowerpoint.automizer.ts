import { Automizer, ISlide, modify, XmlElement } from 'pptx-automizer';
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
const SLIDE_MEMBRES_COMMISSION = 31;
const ANCIENNE_SLIDE_COMMISSION_ET_PIECES = 3;

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

const NOMBRE_LIGNES_PIECES_DU_TEMPLATE = 6;
const NOMBRE_LIGNES_PIECES_SANS_REDUCTION = 8;
const HAUT_DE_LA_LISTE_DE_PIECES = 3878461;
const PAS_ENTRE_DEUX_LIGNES_DE_PIECES = 661987;
const ECART_ENTRE_HAUT_DE_LIGNE_ET_TEXTE = 190500;

type DispositionDesPieces = { pas: number; echelle: number };

const dispositionDesPieces = (nombrePieces: number): DispositionDesPieces => {
  const nombreLignesARepartir = Math.max(
    nombrePieces,
    NOMBRE_LIGNES_PIECES_SANS_REDUCTION
  );
  const pas =
    (PAS_ENTRE_DEUX_LIGNES_DE_PIECES * NOMBRE_LIGNES_PIECES_SANS_REDUCTION) /
    nombreLignesARepartir;
  return { pas, echelle: pas / PAS_ENTRE_DEUX_LIGNES_DE_PIECES };
};

const reduisLaPolice = (echelle: number) => (forme: XmlElement) => {
  ['a:rPr', 'a:endParaRPr'].forEach((balise) =>
    Array.from(forme.getElementsByTagName(balise)).forEach((proprietes) => {
      const taille = proprietes.getAttribute('sz');
      if (taille) {
        proprietes.setAttribute(
          'sz',
          String(Math.round(Number(taille) * echelle))
        );
      }
    })
  );
};

const positionsDeLaLigne = (
  numeroLigne: number,
  { pas, echelle }: DispositionDesPieces
) => {
  const hautDeLigne = HAUT_DE_LA_LISTE_DE_PIECES + (numeroLigne - 1) * pas;
  return {
    caseEtTexte: [
      modify.setPosition({
        y: hautDeLigne + ECART_ENTRE_HAUT_DE_LIGNE_ET_TEXTE * echelle,
      }),
      reduisLaPolice(echelle),
    ],
    separateur: modify.setPosition({ y: hautDeLigne + pas }),
  };
};

const ecrisPieceDansUneLigneDuTemplate = (
  slide: ISlide,
  piece: PieceDuDossier,
  numeroLigne: number,
  disposition: DispositionDesPieces
) => {
  const { caseEtTexte, separateur } = positionsDeLaLigne(
    numeroLigne,
    disposition
  );
  slide.modifyElement(`piece-${numeroLigne}-case`, caseEtTexte);
  slide.modifyElement(`piece-${numeroLigne}-texte`, [
    modify.setText(piece.intitule),
    ...caseEtTexte,
  ]);
  slide.modifyElement(`piece-${numeroLigne}-separateur`, separateur);
};

const ajouteLigneDePieceSousLeTemplate = (
  slide: ISlide,
  piece: PieceDuDossier,
  numeroLigne: number,
  disposition: DispositionDesPieces
) => {
  const { caseEtTexte, separateur } = positionsDeLaLigne(
    numeroLigne,
    disposition
  );
  const derniereLigne = `piece-${NOMBRE_LIGNES_PIECES_DU_TEMPLATE}`;
  slide.addElement(
    MODELE,
    ANCIENNE_SLIDE_COMMISSION_ET_PIECES,
    `${derniereLigne}-case`,
    caseEtTexte
  );
  slide.addElement(
    MODELE,
    ANCIENNE_SLIDE_COMMISSION_ET_PIECES,
    `${derniereLigne}-texte`,
    [modify.setText(piece.intitule), ...caseEtTexte]
  );
  slide.addElement(
    MODELE,
    ANCIENNE_SLIDE_COMMISSION_ET_PIECES,
    `${derniereLigne}-separateur`,
    separateur
  );
};

const ecrisPiecesDuDossier = (slide: ISlide, pieces: PieceDuDossier[]) => {
  const disposition = dispositionDesPieces(pieces.length);
  pieces.forEach((piece, index) => {
    const numeroLigne = index + 1;
    if (numeroLigne <= NOMBRE_LIGNES_PIECES_DU_TEMPLATE) {
      ecrisPieceDansUneLigneDuTemplate(slide, piece, numeroLigne, disposition);
    } else {
      ajouteLigneDePieceSousLeTemplate(slide, piece, numeroLigne, disposition);
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
    presentation.addSlide(MODELE, SLIDE_MEMBRES_COMMISSION, (slide) => {
      ecrisAutoriteHomologation(slide, autorite);
    });
    presentation.addSlide(
      MODELE,
      ANCIENNE_SLIDE_COMMISSION_ET_PIECES,
      (slide) => {
        ecrisAutoriteHomologation(slide, autorite);
        ecrisPiecesDuDossier(slide, piecesDuDossier);
        retireLignesDePiecesInutilisees(slide, piecesDuDossier.length);
      }
    );

    const archive = await presentation.getJSZip();
    return archive.generateAsync({ type: 'nodebuffer' });
  }
}
