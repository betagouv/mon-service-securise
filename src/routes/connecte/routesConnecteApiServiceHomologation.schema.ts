import { z } from 'zod';
import { schemaDate } from '../../http/schemas/date.schema.js';
import { ReferentielV2 } from '../../referentiel.interface.js';

export const schemaPutAutoriteHomologation = () => ({
  nom: z.string().trim().min(1).max(200),
  fonction: z.string().trim().min(1).max(400),
});

export const schemaPutDecisionHomologation = (referentiel: ReferentielV2) => ({
  dateHomologation: schemaDate.uneDateValideEnChaine(),
  dureeValidite: z.enum(referentiel.identifiantsEcheancesRenouvellement()),
});
