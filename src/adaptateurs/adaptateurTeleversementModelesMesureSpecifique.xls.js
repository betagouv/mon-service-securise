const { encode } = require('html-entities');
const { LecteurExcel } = require('./excel/LecteurExcel');

const ENTETE_DESCRIPTION = 'Intitulé de la mesure *';
const ENTETE_MODALITES = 'Description de la mesure';
const ENTETE_CATEGORIE = 'Catégorie *';

async function extraisDonneesTeleversees(buffer) {
  const lecteur = new LecteurExcel(buffer);
  const donneesBrutes = lecteur.donneesDeFeuille('Template mesures', 6);
  return donneesBrutes.map((ligne) => ({
    description: encode(ligne[ENTETE_DESCRIPTION]),
    modalites: encode(ligne[ENTETE_MODALITES]),
    categorie: ligne[ENTETE_CATEGORIE],
  }));
}

module.exports = { extraisDonneesTeleversees };
