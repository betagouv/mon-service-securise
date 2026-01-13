import { z } from 'zod';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';

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
  statut,
  modalites,
};
