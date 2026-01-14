import { z } from 'zod';
import donneesReferentiel from '../../../donneesReferentiel.js';

export const schemaSuggestionAction = {
  nature: () =>
    z.enum(Object.keys(donneesReferentiel.naturesSuggestionsActions)),
};
