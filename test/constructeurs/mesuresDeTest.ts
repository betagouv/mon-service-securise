import { MesuresPersonnalisees } from '../../src/modeles/mesures.js';
import { DonneesMesureSpecifique } from '../../src/modeles/mesureSpecifique.js';

// Ces données factices de mesures peuvent être partielles : chaque test ne renseigne que ce qui le concerne
// (ex. une mesure personnalisée sans catégorie, une mesure spécifique sans identifiant)

type MesurePersonnaliseeDeTest = Record<string, unknown>;

type MesureSpecifiqueDeTest = Partial<Omit<DonneesMesureSpecifique, 'id'>> & {
  id?: string;
};

export const mesuresPersonnaliseesDeTest = (
  mesures: Record<string, MesurePersonnaliseeDeTest>
): MesuresPersonnalisees => mesures as MesuresPersonnalisees;

export const mesuresSpecifiquesDeTest = (
  mesures: MesureSpecifiqueDeTest[]
): DonneesMesureSpecifique[] => mesures as DonneesMesureSpecifique[];
