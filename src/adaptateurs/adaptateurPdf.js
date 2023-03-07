const puppeteer = require('puppeteer');

const genereAnnexesAvisDossierDecision = () => puppeteer.launch({ headless: true,
  args: process.env.NODE_ENV === 'development' ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] })
  .then((browser) => browser.newPage())
  .then((page) => page.setContent('<!doctype html><html lang="fr"><body><h1 style="color: black;">Hello from Puppeteer !</h1></body></html>', { waitUntil: 'networkidle0' })
    .then(() => page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div>Ceci est un header</div>',
      footerTemplate: '<div></div>',
      margin: {
        bottom: '2cm',
        left: '1cm',
        right: '1cm',
        top: '2cm',
      },
    // eslint-disable-next-line no-console
    }))).catch(console.error);

module.exports = { genereAnnexesAvisDossierDecision };
