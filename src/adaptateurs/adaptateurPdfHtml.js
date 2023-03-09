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
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(contenuHtml);
    return await page.pdf(formatPdfA4(enteteHtml, piedPageHtml));
  } finally {
    if (browser !== null) await browser.close();
  }
};

const genereAnnexes = async ({
  donneesDescription,
  donneesMesures,
  donneesRisques,
  referentiel,
}) => {
  const genereAnnexesHtml = pug.compileFile('src/pdf/modeles/annexeDescription.pug');
  const genereEntete = pug.compileFile('src/pdf/modeles/annexeDescription.entete.pug');
  const generePiedPage = pug.compileFile('src/pdf/modeles/annexeDescription.piedpage.pug');

  const pdf = await generePdf(
    genereAnnexesHtml({ donneesDescription, donneesMesures, donneesRisques, referentiel }),
    genereEntete(),
    generePiedPage({ nomService: donneesDescription.nomService })
  );

  return pdf;
};

const genereDossierDecision = async () => {
  const genereDossierHtml = pug.compileFile('src/pdf/modeles/dossierDecision.pug');
  const dossierHtml = genereDossierHtml();
  const pdf = await generePdf(dossierHtml, '<div></div>', '<div></div>');
  return pdf;
};

module.exports = { genereAnnexes, genereDossierDecision };
