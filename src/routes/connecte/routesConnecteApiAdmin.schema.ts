import { z } from 'zod';
import { schemaSiret } from '../../http/schemas/siret.schema.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';

export const schemaPostAdminNomme = z.strictObject({
  emails: z.array(z.email()).min(1).max(50),
  siret: schemaSiret.siret(),
});

export const schemaDeleteAdmin = z.strictObject({
  siret: schemaSiret.siret(),
  idUtilisateur: z.uuid(),
});

export const schemaAttributionRoleServices = z.strictObject({
  role: z.enum([
    Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
    Autorisation.RESUME_NIVEAU_DROIT.ECRITURE,
    Autorisation.RESUME_NIVEAU_DROIT.LECTURE,
  ]),
  idsServices: z.array(z.uuid()).min(1),
});

export const schemaRetraitAccesServices = z.strictObject({
  idsServices: z.array(z.uuid()).min(1),
});

export const schemaStatistiquesAdmin = z.strictObject({
  filtreNiveauxSecurite: z
    .array(z.enum(Object.keys(questionsV2.niveauSecurite)))
    .default([]),
  filtreEntites: z.array(schemaSiret.siret()).default([]),
});

export const schemaPutPerimetreAdmin = z.strictObject({
  siretsAAjouter: z.array(schemaSiret.siret()),
  siretsARetirer: z.array(schemaSiret.siret()),
});
