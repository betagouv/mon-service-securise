const { PDFDocument } = require('pdf-lib');
const pug = require('pug');
const { readFile } = require('fs/promises');
const { decode } = require('html-entities');
const { resolve } = require('path');
const { lanceNavigateur } = require('./adaptateurPdf.puppeteer');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');
const {
  instructionsTamponHomologation,
  configurationsDispositifs,
} = require('./adaptateurPdf.configurationTamponHomologation');

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

const genereHtml = async (pugCorps, paramsCorps, nomService) => {
  const piedPage = pug.compileFile('src/pdf/modeles/annexe.piedpage.pug')({
    nomService,
  });
  return Promise.all([
    pug.compileFile(`src/pdf/modeles/${pugCorps}.pug`)(paramsCorps),
    pug.compileFile(`src/pdf/modeles/${pugCorps}.entete.pug`)(),
  ]).then(([corps, entete]) => ({ corps, entete, piedPage }));
};

const genereAnnexes = async ({
  donneesDescription,
  donneesMesures,
  donneesRisques,
  referentiel,
}) => {
  try {
    const risquesPresents =
      Object.keys(donneesRisques.risquesParNiveauGravite).length > 0;

    const [description, mesures, risques] = await Promise.all([
      genereHtml(
        'annexeDescription',
        { donneesDescription },
        donneesDescription.nomService
      ),
      genereHtml(
        'annexeMesures',
        { donneesMesures, referentiel },
        donneesDescription.nomService
      ),
      risquesPresents
        ? genereHtml(
            'annexeRisques',
            { donneesRisques, referentiel },
            donneesDescription.nomService
          )
        : null,
    ]);

    const pdfs = await generePdfs(
      risquesPresents ? [description, mesures, risques] : [description, mesures]
    );

    return fusionnePdfs(pdfs);
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    throw e;
  }
};

const genereDossierDecision = async (donnees) => {
  try {
    const documentsPresent = donnees.documents.length > 0;

    const htmls = await Promise.all([
      genereHtml('dossierDecision', { donnees }, donnees.nomService),
      genereHtml('annexeAvis', { donnees }, donnees.nomService),
      documentsPresent
        ? genereHtml('annexeDocuments', { donnees }, donnees.nomService)
        : null,
    ]);

    const pdfs = await generePdfs(htmls.filter((a) => a !== null));

    return fusionnePdfs(pdfs);
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    throw e;
  }
};

const genereSyntheseSecurite = async (donnees) => {
  try {
    const html = await genereHtml(
      'syntheseSecurite',
      { donnees },
      donnees.service.nomService()
    );
    const pdf = await generePdfs([html]);
    return fusionnePdfs(pdf);
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    throw e;
  }
};

const genereTamponHomologation = async (donnees) => {
  let navigateur = null;
  try {
    navigateur = await lanceNavigateur();
    const compileImageEnHTMLBase64 = (buffer, largeur, hauteur) =>
      Buffer.from(
        pug.compileFile('src/pdf/modeles/tamponHomologation.base64.pug')({
          base64: buffer.toString('base64'),
          largeur,
          hauteur,
        }),
        'utf-8'
      );

    const fichiers = [];
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */
    for (const {
      tailleDispositif,
      taillesTexte,
      largeur,
      hauteur,
    } of configurationsDispositifs) {
      const corps = pug.compileFile('src/pdf/modeles/tamponHomologation.pug')({
        ...donnees,
        taillesTexte,
        tailleDispositif,
        decode,
      });

      const page = await navigateur.newPage();
      await page.setContent(corps);
      const screenshotBase64 = await page.screenshot({
        encoding: 'base64',
        type: 'png',
        omitBackground: true,
        clip: { width: largeur, height: hauteur, x: 0, y: 0, scale: 4 },
      });

      const bufferImage = Buffer.from(screenshotBase64, 'base64');
      fichiers.push({
        nom: `encartHomologation.${tailleDispositif}.png`,
        buffer: bufferImage,
      });

      fichiers.push({
        nom: `encartHomologation.${tailleDispositif}.html`,
        buffer: compileImageEnHTMLBase64(bufferImage, largeur, hauteur),
      });
    }
    /* eslint-enable no-await-in-loop */
    /* eslint-enable no-restricted-syntax */
    fichiers.push({
      nom: 'instructions.txt',
      buffer: instructionsTamponHomologation,
    });

    const imageTamponHomologation = await readFile(
      resolve(__dirname, '../../public/assets/images/tampon_homologation.png')
    );
    fichiers.push({
      nom: 'tamponHomologation.png',
      buffer: imageTamponHomologation,
    });
    fichiers.push({
      nom: `tamponHomologation.html`,
      buffer: compileImageEnHTMLBase64(imageTamponHomologation, 214, 214),
    });

    return fichiers;
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    throw e;
  } finally {
    if (navigateur !== null) await navigateur.close();
  }
};

module.exports = {
  genereAnnexes,
  genereDossierDecision,
  genereSyntheseSecurite,
  genereTamponHomologation,
};
