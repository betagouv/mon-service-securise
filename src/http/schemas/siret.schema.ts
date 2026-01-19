import { z } from 'zod';

const regexSiret = /^\d{14}$/;

export const schemaSiret = {
  siret: () => z.string().regex(regexSiret),
  regexSiret: () => regexSiret,
};
