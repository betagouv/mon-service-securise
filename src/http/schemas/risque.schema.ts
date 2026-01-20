import { z } from 'zod';
import { ReferentielV2 } from '../../referentiel.interface.js';

const niveauGravite = (referentielV2: ReferentielV2) =>
  z.enum(referentielV2.identifiantsNiveauxGravite()).or(z.literal(''));

const niveauVraisemblance = (referentielV2: ReferentielV2) =>
  z.enum(referentielV2.identifiantsNiveauxVraisemblance()).or(z.literal(''));

export const schemaRisqueGeneral = {
  niveauGravite,
  niveauVraisemblance,
};

export const schemaRisqueSpecifique = {
  niveauGravite,
  niveauVraisemblance,
};
