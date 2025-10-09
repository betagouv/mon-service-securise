import * as fs from 'node:fs';
import { LecteurDeCSVDeReglesV2 } from './moteurRegles/v2/parsing/lecteurDeCSVDeReglesV2.js';
import { mesuresV2 } from '../donneesReferentielMesuresV2.js';
import { creeReferentiel } from './referentiel.js';

export const fabriqueReferentiel = () => {
  const fichierMesuresProd = `${
    import.meta.dirname
  }/moteurRegles/v2/mesures_V2_prod_30-09-2025.csv`;
  if (!fs.existsSync(fichierMesuresProd))
    throw new Error(
      `Le fichier ${fichierMesuresProd} n'existe pas, impossible d'initialiser le moteur de règles V2.`
    );

  const regles = new LecteurDeCSVDeReglesV2(mesuresV2).lis(fichierMesuresProd);

  const referentiel = creeReferentiel();
  referentiel.enregistreReglesMoteurV2(regles);

  return referentiel;
};
