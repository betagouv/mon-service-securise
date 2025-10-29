import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';
import { mesuresV2 } from '../donneesReferentielMesuresV2.js';
import {
  IdMesureV2,
  ReglesDuReferentielMesuresV2,
} from './moteurRegles/v2/moteurReglesV2.js';

export type DonneesReferentielV2 = {
  mesures: typeof mesuresV2;
};

type MethodesSpecifiquesReferentielV2 = {
  enregistreReglesMoteurV2: (regles: ReglesDuReferentielMesuresV2) => void;
  reglesMoteurV2: () => ReglesDuReferentielMesuresV2;
};

export const creeReferentielV2 = (
  donnees: DonneesReferentielV2 = { mesures: mesuresV2 }
): Referentiel & MethodesSpecifiquesReferentielV2 => {
  let reglesMoteurV2Enregistrees: ReglesDuReferentielMesuresV2 = [];
  const identifiantsMesure = new Set<string>(Object.keys(donnees.mesures));

  const enregistreReglesMoteurV2 = (regles: ReglesDuReferentielMesuresV2) => {
    reglesMoteurV2Enregistrees = regles;
  };

  const estIdentifiantMesureConnu = (id: IdMesureV2) =>
    identifiantsMesure.has(id);

  const mesure = (idMesure: IdMesureV2) => donnees.mesures[idMesure];

  const reglesMoteurV2 = () => reglesMoteurV2Enregistrees;
  return {
    ...creeReferentiel(),
    enregistreReglesMoteurV2,
    estIdentifiantMesureConnu,
    mesure,
    reglesMoteurV2,
    version: () => 'v2',
  };
};
