import { z } from 'zod';
import { ReferentielV2 } from '../../referentiel.interface.js';

const niveauGraviteObligatoire = (referentielV2: ReferentielV2) =>
  z.enum(referentielV2.identifiantsNiveauxGravite());

const niveauGravite = (referentielV2: ReferentielV2) =>
  niveauGraviteObligatoire(referentielV2).or(z.literal(''));

const niveauVraisemblanceObligatoire = (referentielV2: ReferentielV2) =>
  z.enum(referentielV2.identifiantsNiveauxVraisemblance());

const niveauVraisemblance = (referentielV2: ReferentielV2) =>
  niveauVraisemblanceObligatoire(referentielV2).or(z.literal(''));

export const schemaRisqueGeneral = {
  niveauGravite,
  niveauVraisemblance,
};

export const schemaRisqueSpecifique = {
  niveauGravite,
  niveauVraisemblance,
};

export const schemaRisqueSpecifiqueV2 = {
  niveauVraisemblance: niveauVraisemblanceObligatoire,
  niveauGravite: niveauGraviteObligatoire,
  categories: (referentielV2: ReferentielV2) =>
    z.array(z.enum(referentielV2.identifiantsCategoriesRisque())).min(1),
};
