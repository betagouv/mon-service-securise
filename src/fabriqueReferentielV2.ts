import * as fs from 'node:fs';
import { LecteurDeCSVDeReglesV2 } from './moteurRegles/v2/parsing/lecteurDeCSVDeReglesV2.js';
import { mesuresV2 } from '../donneesReferentielMesuresV2.js';
import { creeReferentielV2 } from './referentielV2.js';

export const fabriqueReferentielV2 = () => {
  const fichierMesuresProd = `${
    import.meta.dirname
  }/moteurRegles/v2/mesures_V2_prod_30-09-2025.csv`;
  if (!fs.existsSync(fichierMesuresProd))
    throw new Error(
      `Le fichier ${fichierMesuresProd} n'existe pas, impossible d'initialiser le moteur de règles V2.`
    );

  const regles = new LecteurDeCSVDeReglesV2(mesuresV2).lis(fichierMesuresProd);

  const referentielV2 = creeReferentielV2();
  referentielV2.enregistreReglesMoteurV2(regles);

  return referentielV2;
};
