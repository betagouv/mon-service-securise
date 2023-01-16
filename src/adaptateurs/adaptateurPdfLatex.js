const fsPromises = require('fs/promises');
const pdflatex = require('node-pdflatex').default;
const { PDFDocument } = require('pdf-lib');

const fabriquantGabarit = require('../latex/fabriquantGabarit');
const { miseEnFormeLatex } = require('../latex/miseEnFormeDonnees');

const generationPdfLatex = (cheminFichierTex, donnees = {}) => fsPromises
  .readFile(cheminFichierTex)
  .then((donneesFichier) => {
    donnees.CHEMIN_BASE_ABSOLU = process.env.CHEMIN_BASE_ABSOLU;
    const donneesMisesEnForme = miseEnFormeLatex(donnees);
    const texConfectionne = fabriquantGabarit.confectionne(
      donneesFichier.toString(), donneesMisesEnForme
    );
    return pdflatex(texConfectionne);
  });

const ajoutePdf = (accumulateurPdf, pdfAAjouter) => accumulateurPdf
  .then((pdfFusion) => pdfAAjouter
    .then((pdfAnnexe) => PDFDocument.load(pdfAnnexe))
    .then((pdf) => {
      pdfFusion.copyPages(pdf, pdf.getPageIndices()).then((pagesCopiees) => {
        pagesCopiees.forEach((page) => pdfFusion.addPage(page));
      });
      return pdfFusion;
    }));

const genereAnnexeDescription = (donnees) => generationPdfLatex('src/vuesTex/annexeDescription.template.tex', donnees);

const genereAnnexeMesures = (donnees) => generationPdfLatex('src/vuesTex/annexeMesures.template.tex', donnees);

const genereAnnexeRisques = (donnees) => generationPdfLatex('src/vuesTex/annexeRisques.template.tex', donnees);

const genereAnnexes = ({ donneesMesures, donneesRisques }) => (
  ajoutePdf(PDFDocument.create(), genereAnnexeMesures(donneesMesures))
    .then((pdfFusion) => ajoutePdf(
      Promise.resolve(pdfFusion), genereAnnexeRisques(donneesRisques)
    ))
    .then((pdfFusion) => pdfFusion.save())
    .then((pdf) => Buffer.from(pdf.buffer, 'binary'))
);

module.exports = { genereAnnexes, genereAnnexeDescription };
