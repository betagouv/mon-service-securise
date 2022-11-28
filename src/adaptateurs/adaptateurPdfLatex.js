const fsPromises = require('fs/promises');
const pdflatex = require('node-pdflatex').default;

const fabriquantGabarit = require('../latex/fabriquantGabarit');
const { miseEnFormeLatex } = require('../latex/miseEnFormeDonnees');

const generationPdfLatex = (cheminFichierTex, donnees = {}) => fsPromises
  .readFile(cheminFichierTex)
  .then((donneesFichier) => {
    const donneesMisesEnForme = miseEnFormeLatex(donnees);
    const texConfectionne = fabriquantGabarit.confectionne(
      donneesFichier.toString(), donneesMisesEnForme
    );
    return pdflatex(texConfectionne);
  });

const genereAnnexeMesures = (donnees) => generationPdfLatex('src/vuesTex/annexeMesures.template.tex', donnees);

const genereAnnexeRisques = (donnees) => generationPdfLatex('src/vuesTex/annexeRisques.template.tex', donnees);

module.exports = { genereAnnexeMesures, genereAnnexeRisques };
