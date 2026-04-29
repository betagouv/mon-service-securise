import { z } from 'zod';
import { schemaDate } from '../../http/schemas/date.schema.js';
import {
  ReferentielV2,
  TousReferentiels,
} from '../../referentiel.interface.js';

export const schemaPostRepriseHomologation = (
  referentiel: TousReferentiels
) => ({
  etapeDemandee: z.enum(
    referentiel.etapesParcoursHomologation().map((e) => e.id)
  ),
});

export const schemaPutAutoriteHomologation = () => ({
  nom: z.string().trim().min(1).max(200),
  fonction: z.string().trim().min(1).max(400),
});

export const schemaPutDecisionHomologation = (referentiel: ReferentielV2) =>
  z
    .strictObject({
      dateHomologation: schemaDate.uneDateValideEnChaine(),
      dureeValidite: z.enum(referentiel.identifiantsEcheancesRenouvellement()),
    })
    .or(
      z.strictObject({
        dateHomologation: schemaDate.uneDateValideEnChaine(),
        refusee: z.literal(true),
      })
    );

export const schemaPutDocumentsHomologation = () => ({
  avecDocuments: z.boolean(),
  documents: z.array(z.string().max(1000)),
});

export const schemaPutAvisHomologation = (referentiel: ReferentielV2) => ({
  avecAvis: z.boolean(),
  avis: z.array(
    z.strictObject({
      collaborateurs: z.array(z.string()).min(1),
      statut: z.enum(Object.keys(referentiel.statutsAvisDossierHomologation())),
      dureeValidite: z.enum(referentiel.identifiantsEcheancesRenouvellement()),
      commentaires: z.string().max(1000).optional(),
    })
  ),
});
