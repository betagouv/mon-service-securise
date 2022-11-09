const express = require('express');
const fsPromises = require('fs/promises');
const pdflatex = require('node-pdflatex').default;

const { miseEnFormeLatex } = require('../latex/miseEnFormeDonnees');
const moteurModeleParDefaut = require('../latex/moteurs/moteurModele');

const latexPdf = ({ confectionne }) => ({
  genere: (urlSource, donneesAInjecter) => fsPromises.readFile(urlSource)
    .then((donneesFichier) => {
      const pdfConfectionne = confectionne(donneesFichier.toString(), donneesAInjecter);
      return pdflatex(pdfConfectionne);
    }),
});

const routesPdf = (middleware, moteurModele = moteurModeleParDefaut) => {
  const routes = express.Router();

  routes.get('/:id/annexesMesures.pdf',
    middleware.trouveHomologation,
    (requete, reponse, suite) => {
      const { homologation } = requete;
      const donneesMisesEnForme = miseEnFormeLatex(homologation.mesuresParStatut());
      const generateurLatex = latexPdf(moteurModele);
      const donneesAInjecter = { categorie: 'PROTECTION', mesures: donneesMisesEnForme.enCours.protection };
      generateurLatex.genere('src/latex/vues/annexesMesures.template.tex', donneesAInjecter)
        .then((pdf) => {
          reponse.contentType('application/pdf');
          reponse.send(pdf);
        })
        .catch(suite);
    });

  return routes;
};

module.exports = routesPdf;
