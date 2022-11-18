const fsPromises = require('fs/promises');
const pdflatex = require('node-pdflatex').default;

const fabriquantGabarit = require('../latex/fabriquantGabarit');

const generationPdfLatex = (cheminFichierTex, donnees = {}) => fsPromises
  .readFile(cheminFichierTex)
  .then((donneesFichier) => {
    const texConfectionne = fabriquantGabarit.confectionne(donneesFichier.toString(), donnees);
    return pdflatex(texConfectionne);
  });

const genereAnnexeMesures = (donnees) => generationPdfLatex('src/vuesTex/annexeMesures.template.tex', donnees);

module.exports = { genereAnnexeMesures };
