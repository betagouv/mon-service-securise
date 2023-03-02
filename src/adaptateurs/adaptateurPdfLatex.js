const fsPromises = require('fs/promises');
const { decode } = require('html-entities');
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

const genereAnnexeDescription = (donnees) => generationPdfLatex('src/pdf/latex/annexeDescription.template.tex', donnees);

const genereAnnexeMesures = (donnees) => generationPdfLatex('src/pdf/latex/annexeMesures.template.tex', donnees);

const genereAnnexeRisques = (donnees) => generationPdfLatex('src/pdf/latex/annexeRisques.template.tex', donnees);

const genereAnnexes = ({ donneesDescription, donneesMesures, donneesRisques }) => (
  ajoutePdf(PDFDocument.create(), genereAnnexeDescription(donneesDescription))
    .then((pdfFusion) => ajoutePdf(
      Promise.resolve(pdfFusion), genereAnnexeMesures(donneesMesures)
    ))
    .then((pdfFusion) => ajoutePdf(
      Promise.resolve(pdfFusion), genereAnnexeRisques(donneesRisques)
    ))
    .then((pdfFusion) => pdfFusion.save())
    .then((pdf) => Buffer.from(pdf.buffer, 'binary'))
);

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
