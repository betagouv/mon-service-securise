const fsPromises = require('fs/promises');
const { decode } = require('html-entities');
const { PDFDocument } = require('pdf-lib');
const pug = require('pug');
const puppeteer = require('puppeteer');

const formatPdfA4 = (enteteHtml, piedPageHtml) => ({
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: enteteHtml,
  footerTemplate: piedPageHtml,
  margin: { bottom: '2cm', left: '1cm', right: '1cm', top: '23mm' },
});

const generePdf = async (contenuHtml, enteteHtml, piedPageHtml) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--font-render-hinting=none'] });
    const page = await browser.newPage();
    await page.setContent(contenuHtml);
    return await page.pdf(formatPdfA4(enteteHtml, piedPageHtml));
  } finally {
    if (browser !== null) await browser.close();
  }
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
  const generePiedPage = pug.compileFile('src/pdf/modeles/annexe.piedpage.pug');

  const genereAnnexeDescription = pug.compileFile('src/pdf/modeles/annexeDescription.pug');
  const genereEnteteDescription = pug.compileFile('src/pdf/modeles/annexeDescription.entete.pug');
  const annexeDescription = await generePdf(
    genereAnnexeDescription({ donneesDescription }),
    genereEnteteDescription(),
    generePiedPage({ nomService: donneesDescription.nomService })
  );

  const genereAnnexeMesures = pug.compileFile('src/pdf/modeles/annexeMesures.pug');
  const genereEnteteMesures = pug.compileFile('src/pdf/modeles/annexeMesures.entete.pug');
  const annexeMesures = await generePdf(
    genereAnnexeMesures({ donneesMesures, referentiel }),
    genereEnteteMesures(),
    generePiedPage({ nomService: donneesDescription.nomService })
  );

  const genereAnnexeRisques = pug.compileFile('src/pdf/modeles/annexeRisques.pug');
  const genereEnteteRisques = pug.compileFile('src/pdf/modeles/annexeRisques.entete.pug');
  const annexeRisques = await generePdf(
    genereAnnexeRisques({ donneesRisques, referentiel }),
    genereEnteteRisques(),
    generePiedPage({ nomService: donneesDescription.nomService })
  );

  return fusionnePdfs([annexeDescription, annexeMesures, annexeRisques]);
};

const ecrisLeChamp = (formulaire, idChamp, contenu) => {
  const champ = formulaire.getTextField(idChamp);
  if (champ !== undefined && contenu !== undefined) {
    champ.setText(decode(contenu));
    champ.enableReadOnly();
  }
};

const genereDossierDecision = (donnees) => fsPromises
  .readFile('src/pdf/modeles/dossierDecision.pdf')
  .then((donneesFichier) => PDFDocument.load(donneesFichier))
  .then((pdfDocument) => {
    const formulaire = pdfDocument.getForm();

    ecrisLeChamp(formulaire, 'nom_du_service', donnees.nomService);
    ecrisLeChamp(formulaire, 'autorite_prenom_nom', donnees.nomPrenomAutorite);
    ecrisLeChamp(formulaire, 'autorite_fonction', donnees.fonctionAutorite);

    return pdfDocument;
  })
  .then((pdfDocument) => pdfDocument.save({ updateFieldAppearances: false }))
  .then((pdf) => Buffer.from(pdf.buffer, 'binary'));

module.exports = { genereAnnexes, genereDossierDecision };
