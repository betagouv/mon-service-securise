const pug = require('pug');
const puppeteer = require('puppeteer');

const optionsFormatPdf = () => ({
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false,
  margin: { bottom: '2cm', left: '1cm', right: '1cm', top: '23mm' },
});

const genereAnnexes = async ({
  donneesDescription,
  donneesMesures,
  donneesRisques,
  referentiel,
  nonce,
}) => {
  const genereAnnexesHtml = pug.compileFile('src/pdf/modeles/annexes.pug');
  const annexesHtml = genereAnnexesHtml(
    { donneesDescription, donneesMesures, donneesRisques, referentiel, nonce }
  );

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(annexesHtml);
  const pdf = await page.pdf(optionsFormatPdf());
  await browser.close();

  return pdf;
};

const genereDossierDecision = () => Promise.resolve(pug.compileFile('src/pdf/modeles/dossierDecision.pug')());

module.exports = { genereAnnexes, genereDossierDecision };
