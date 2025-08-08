const { encode } = require('html-entities');
const { LecteurExcel } = require('./excel/LecteurExcel');
const { ErreurFichierXlsInvalide } = require('../erreurs');

const ENTETE_INTITULE = 'Intitulé de la mesure *';
const ENTETE_DESCRIPTION = 'Description de la mesure';
const ENTETE_CATEGORIE = 'Catégorie *';

async function extraisDonneesTeleversees(buffer) {
  const lecteur = new LecteurExcel(buffer);
  const donneesBrutes = lecteur.donneesDeFeuille('Template mesures', 6);

  const lignesCompletes = lecteur.lesLignesSontCompletes(donneesBrutes, [
    ENTETE_INTITULE,
    ENTETE_CATEGORIE,
  ]);

  if (!lignesCompletes) throw new ErreurFichierXlsInvalide();

  return donneesBrutes.map((ligne) => ({
    description: encode(ligne[ENTETE_INTITULE]), // Chez MSS, l'intitulé va bien dans "description".
    descriptionLongue: encode(ligne[ENTETE_DESCRIPTION]),
    categorie: ligne[ENTETE_CATEGORIE],
  }));
}

module.exports = { extraisDonneesTeleversees };
