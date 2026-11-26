import {
  lisLignesDeFeuille,
  type LigneExcel,
} from '../../ui/televersement/lecteurExcel';

export type ModeleMesureSpecifiqueTeleverse = {
  description: string;
  descriptionLongue: string;
  categorie: string;
};

const ENTETES = {
  intitule: 'Intitulé de la mesure *',
  description: 'Description de la mesure',
  categorie: 'Catégorie *',
};

export const NOMBRE_MAXIMUM_DE_LIGNES = 40;

const enModeleMesureSpecifique = (
  ligne: LigneExcel
): ModeleMesureSpecifiqueTeleverse => ({
  description: ligne[ENTETES.intitule].trim(),
  descriptionLongue: ligne[ENTETES.description].trim(),
  categorie: ligne[ENTETES.categorie].trim(),
});

export const extraisModelesMesureSpecifique = async (
  contenu: ArrayBuffer
): Promise<ModeleMesureSpecifiqueTeleverse[]> => {
  const lignes = await lisLignesDeFeuille(contenu, {
    nomFeuille: 'Template mesures',
    indexLigneEnTete: 6,
    colonnesAttendues: Object.values(ENTETES),
    nombreMaximumDeLignes: NOMBRE_MAXIMUM_DE_LIGNES,
  });

  return lignes.map(enModeleMesureSpecifique);
};
