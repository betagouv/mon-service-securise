import { z } from 'zod';
import { TousReferentiels } from '../../referentiel.interface.js';

export const schemaPutNouveaute = (referentiel: TousReferentiels) => ({
  id: z.enum(referentiel.nouvellesFonctionnalites().map((n) => n.id)),
});

export const schemaDeleteNouveaute = (referentiel: TousReferentiels) => ({
  id: z.enum(referentiel.nouvellesFonctionnalites().map((n) => n.id)),
});

export const schemaPutTache = () => ({
  id: z.uuid(),
});

export const schemaPutNotificationTransactionnelle = () => ({
  id: z.uuid(),
});

export const schemaDeleteNotificationTransactionnelle = () => ({
  id: z.uuid(),
});
