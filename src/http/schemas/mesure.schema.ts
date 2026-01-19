import { z } from 'zod';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { schemaDate } from './date.schema.js';

const statut = (referentiel: Referentiel, referentielV2: ReferentielV2) =>
  z.enum([
    ...Object.keys(referentiel.statutsMesures()),
    ...Object.keys(referentielV2.statutsMesures()),
  ]);

const modalites = () => z.string().min(0).max(2000);

export const schemaMesureGenerale = {
  id: (referentiel: Referentiel, referentielV2: ReferentielV2) =>
    z.enum([
      ...Object.keys(referentiel.mesures()),
      ...Object.keys(referentielV2.mesures()),
    ]),
  statut,
  modalites,
};

export const schemaMesureSpecifique = {
  categorie: (referentiel: Referentiel, referentielV2: ReferentielV2) =>
    z.enum([
      ...Object.keys(referentiel.categoriesMesures()),
      ...Object.keys(referentielV2.categoriesMesures()),
    ]),
  description: () => z.string().min(1).max(1000),
  descriptionLongue: () => z.string().min(0).max(2000),
  statut,
  modalites,
};

export const schemaPlanActionMesure = {
  priorite: (referentiel: ReferentielV2) =>
    z.enum(Object.keys(referentiel.prioritesMesures())),
  echeance: () => schemaDate.mmJJaaaa(),
  responsables: () => z.array(z.uuid()),
};
