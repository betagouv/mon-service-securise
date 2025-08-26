import { encode } from 'html-entities';
import { LecteurExcel } from './excel/LecteurExcel.js';
import { ErreurFichierXlsInvalide } from '../erreurs.js';

const ENTETE_INTITULE = 'Intitulé de la mesure *';
const ENTETE_DESCRIPTION = 'Description de la mesure';
const ENTETE_CATEGORIE = 'Catégorie *';

const touteLesProprietes = [
  ENTETE_INTITULE,
  ENTETE_DESCRIPTION,
  ENTETE_CATEGORIE,
];

async function extraisDonneesTeleversees(buffer) {
  const lecteur = new LecteurExcel(buffer);

  const donneesBrutes = lecteur.donneesDeFeuille('Template mesures', 6);
  const lignesCompletes = lecteur.lesLignesSontCompletes(
    donneesBrutes,
    touteLesProprietes
  );

  if (!lignesCompletes) throw new ErreurFichierXlsInvalide();

  return donneesBrutes.map((ligne) => ({
    description: encode(ligne[ENTETE_INTITULE]?.trim()), // Chez MSS, l'intitulé va bien dans "description".
    descriptionLongue: encode(ligne[ENTETE_DESCRIPTION]?.trim()),
    categorie: ligne[ENTETE_CATEGORIE]?.trim(),
  }));
}

export { extraisDonneesTeleversees };
