const pug = require('pug');
const puppeteer = require('puppeteer');

const formatPdfA4 = () => ({
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false,
  margin: { bottom: '2cm', left: '1cm', right: '1cm', top: '23mm' },
});

const generePdf = async (contenuHtml) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(contenuHtml);
    return await page.pdf(formatPdfA4());
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
  const genereAnnexesHtml = pug.compileFile('src/pdf/modeles/annexes.pug');
  const annexesHtml = genereAnnexesHtml(
    { donneesDescription, donneesMesures, donneesRisques, referentiel }
  );
  const pdf = await generePdf(annexesHtml);
  return pdf;
};

const genereDossierDecision = async () => {
  const genereDossierHtml = pug.compileFile('src/pdf/modeles/dossierDecision.pug');
  const dossierHtml = genereDossierHtml();
  const pdf = await generePdf(dossierHtml);
  return pdf;
};

module.exports = { genereAnnexes, genereDossierDecision };
