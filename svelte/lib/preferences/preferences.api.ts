import type { Consentements } from './preferences.types';

export const api = {
  sauvegardePreferencesConsentements: async (
    consentements: Partial<Consentements>
  ) => axios.put('/api/utilisateur/preferences/consentements', consentements),
};
