const fsPromises = require('fs/promises');
const { decode } = require('html-entities');
const { PDFDocument } = require('pdf-lib');
const pug = require('pug');
const { lanceNavigateur } = require('./adaptateurPdf.puppeteer');

const formatPdfA4 = (enteteHtml, piedPageHtml) => ({
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: enteteHtml,
  footerTemplate: piedPageHtml,
  margin: { bottom: '2cm', left: '1cm', right: '1cm', top: '23mm' },
});

const generePdfs = async (pagesHtml) => {
  /* eslint-disable no-await-in-loop */
  /* eslint-disable no-restricted-syntax */
  let navigateur = null;
  try {
    navigateur = await lanceNavigateur();

    const pagesPdf = [];
    for (const { corps, entete, piedPage } of pagesHtml) {
      const page = await navigateur.newPage();
      await page.setContent(corps);
      const pdf = await page.pdf(formatPdfA4(entete, piedPage));
      pagesPdf.push(pdf);
    }

    return pagesPdf;
  } finally {
    if (navigateur !== null) await navigateur.close();
  }
  /* eslint-enable no-await-in-loop */
  /* eslint-enable no-restricted-syntax */
};

const fusionnePdfs = async (pdfs) => {
  /* eslint-disable no-await-in-loop */
  /* eslint-disable no-restricted-syntax */
  const fusion = await PDFDocument.create();

  for (const source of pdfs) {
    const document = await PDFDocument.load(source);
    const copie = await fusion.copyPages(document, document.getPageIndices());
    copie.forEach((page) => fusion.addPage(page));
  }

  const pdfFinal = await fusion.save();
  return Buffer.from(pdfFinal.buffer, 'binary');
  /* eslint-enable no-await-in-loop */
  /* eslint-enable no-restricted-syntax */
};

const genereAnnexes = async ({
  donneesDescription,
  donneesMesures,
  donneesRisques,
  referentiel,
}) => {
  const genereHtml = async (pugCorps, paramsCorps) => {
    const piedPage = pug.compileFile('src/pdf/modeles/annexe.piedpage.pug')({ nomService: donneesDescription.nomService });
    return Promise.all([
      pug.compileFile(`src/pdf/modeles/${pugCorps}.pug`)(paramsCorps),
      pug.compileFile(`src/pdf/modeles/${pugCorps}.entete.pug`)(),
    ]).then(([corps, entete]) => ({ corps, entete, piedPage }));
  };

  const risquesPresents = Object.keys(donneesRisques.risquesParNiveauGravite).length > 0;

  const [description, mesures, risques] = await Promise.all([
    genereHtml('annexeDescription', { donneesDescription }),
    genereHtml('annexeMesures', { donneesMesures, referentiel }),
    risquesPresents ? genereHtml('annexeRisques', { donneesRisques, referentiel }) : null,
  ]);

  const pdfs = await generePdfs(risquesPresents
    ? [description, mesures, risques]
    : [description, mesures]);

  return fusionnePdfs(pdfs);
};

const ecrisLeChamp = (formulaire, idChamp, contenu) => {
  const champ = formulaire.getTextField(idChamp);
  if (champ !== undefined && contenu !== undefined) {
    champ.setText(decode(contenu));
    champ.enableReadOnly();
  }
};

const genereDossierDecision = async (donnees) => {
  const fichierPdf = await fsPromises.readFile('src/pdf/modeles/dossierDecision.pdf');
  const documentPdf = await PDFDocument.load(fichierPdf);
  const formulaire = documentPdf.getForm();

  ecrisLeChamp(formulaire, 'nom_du_service', donnees.nomService);
  ecrisLeChamp(formulaire, 'autorite_prenom_nom', donnees.nomPrenomAutorite);
  ecrisLeChamp(formulaire, 'autorite_fonction', donnees.fonctionAutorite);

  const pdfDecision = await documentPdf.save({ updateFieldAppearances: false });

  if (donnees.avis.length === 0) {
    return Buffer.from(pdfDecision.buffer, 'binary');
  }

  const premierePage = await documentPdf.save({ updateFieldAppearances: false });

  const [entete, corps, piedPage] = await Promise.all([
    pug.compileFile('src/pdf/modeles/annexeAvis.entete.pug')(),
    pug.compileFile('src/pdf/modeles/annexeAvis.pug')({ donnees }),
    pug.compileFile('src/pdf/modeles/annexe.piedpage.pug')({ nomService: donnees.nomService }),
  ]);
  const annexeAvis = await generePdfs([{ entete, corps, piedPage }]);

  return fusionnePdfs([premierePage, ...annexeAvis]);
};

module.exports = { genereAnnexes, genereDossierDecision };
