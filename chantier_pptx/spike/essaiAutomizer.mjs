import automizerPkg from 'pptx-automizer';

const {
  default: Automizer,
  modify,
  ModifyColorHelper,
  ModifyTextHelper,
} = automizerPkg;

// Largeurs (EMU) reprises de la légende de la slide 19, où le designer a dimensionné chaque pastille.
const PASTILLES_STATUT = {
  fait: {
    texte: '0C8626',
    fond: 'D4F4DB',
    libelle: 'FAITE',
    largeurFond: 914474,
    largeurTexte: 723974,
  },
  enCours: {
    texte: '0079D0',
    fond: 'DBEEFF',
    libelle: 'PARTIELLE',
    largeurFond: 1519758,
    largeurTexte: 1329258,
  },
  nonFait: {
    texte: 'FAA72C',
    fond: 'FFF2DE',
    libelle: 'NON PRISE EN COMPTE',
    largeurFond: 2946722,
    largeurTexte: 2768424,
  },
  aLancer: {
    texte: '7025DA',
    fond: 'E9DDFF',
    libelle: 'À LANCER',
    largeurFond: 1447800,
    largeurTexte: 1257300,
  },
};

const rgb = (value) => ({ type: 'srgbClr', value });

const colorePastille = (slide, nomFond, nomTexte, statut) => {
  const { texte, fond, libelle, largeurFond, largeurTexte } =
    PASTILLES_STATUT[statut];
  slide.modifyElement(nomFond, [
    ModifyColorHelper.solidFill(rgb(fond)),
    modify.setPosition({ w: largeurFond }),
  ]);
  slide.modifyElement(nomTexte, [
    modify.setText(libelle),
    ModifyTextHelper.setColor(rgb(texte)),
    modify.setPosition({ w: largeurTexte }),
  ]);
  return largeurFond;
};

const X_PASTILLE_ANNEXE = 838200;
const ECART_PASTILLE_COMPTEUR = 190500;

const LARGEUR_PISTE = 7353300;
const X_PISTE = 1219200;

const ajusteBarre = (slide, proportionFaites, proportionPartielles) => {
  const largeurFaites = Math.round(LARGEUR_PISTE * proportionFaites);
  const largeurPartielles = Math.round(LARGEUR_PISTE * proportionPartielles);
  slide.modifyElement('Shape 12', [modify.setPosition({ w: largeurFaites })]);
  slide.modifyElement('Shape 13', [
    modify.setPosition({ x: X_PISTE + largeurFaites, w: largeurPartielles }),
  ]);
  slide.modifyElement('Shape 14', [
    modify.setPosition({
      x: X_PISTE + largeurFaites + largeurPartielles,
      w: LARGEUR_PISTE - largeurFaites - largeurPartielles,
    }),
  ]);
};

const pagesAnnexe = [
  { statut: 'fait', nombre: 21, premiereMesure: 'Page 1 : mesure faite' },
  {
    statut: 'fait',
    nombre: 21,
    premiereMesure: 'Page 2 : suite des mesures faites',
  },
  { statut: 'aLancer', nombre: 4, premiereMesure: 'Page 3 : mesure à lancer' },
  {
    statut: 'nonFait',
    nombre: 2,
    premiereMesure: 'Page 4 : libellé le plus long',
  },
];

const automizer = new Automizer({
  templateDir: 'templates',
  outputDir: 'sorties',
  removeExistingSlides: true,
  autoImportSlideMasters: false,
  cleanup: true,
  compression: 6,
});

const presentation = automizer
  .loadRoot('support.pptx')
  .load('support.pptx', 'modele');

presentation.addSlide('modele', 1, (slide) => {
  slide.modifyElement('Text 11', [modify.setText('Mon super service')]);
  slide.modifyElement('Text 12', [
    modify.setText('Date de création : 09/11/2026'),
  ]);
});

presentation.addSlide('modele', 19, (slide) => {
  ajusteBarre(slide, 0.5, 0.2);
});

presentation.addSlide('modele', 20, (slide) => {
  colorePastille(slide, 'Shape 24', 'Text 25', 'aLancer');
});

pagesAnnexe.forEach(({ statut, nombre, premiereMesure }) => {
  presentation.addSlide('modele', 27, (slide) => {
    const largeurPastille = colorePastille(slide, 'Shape 5', 'Text 6', statut);
    slide.modifyElement('Text 7', [
      modify.setText(`${nombre} mesures`),
      modify.setPosition({
        x: X_PASTILLE_ANNEXE + largeurPastille + ECART_PASTILLE_COMPTEUR,
      }),
    ]);
    slide.modifyElement('Text 17', [modify.setText(premiereMesure)]);
    if (statut === 'aLancer') {
      [
        'Shape 48',
        'Text 49',
        'Shape 50',
        'Text 51',
        'Shape 52',
        'Text 53',
        'Shape 54',
        'Text 55',
      ].forEach((nom) => slide.removeElement(nom));
    }
  });
});

const resume = await presentation.write('essaiAutomizer.pptx');
console.log(resume);
