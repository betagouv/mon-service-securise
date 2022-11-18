const fsPromises = require('fs/promises');
const pdflatex = require('node-pdflatex').default;

const generationPdfLatex = (cheminFichierTex) => fsPromises
  .readFile(cheminFichierTex)
  .then((donneesFichier) => pdflatex(donneesFichier.toString()));

const genereAnnexeMesures = () => generationPdfLatex('src/vuesTex/annexeMesures.tex');

module.exports = { genereAnnexeMesures };
