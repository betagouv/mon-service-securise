import type { Consentements } from './preferences.types';

export const api = {
  sauvegardePreferences: async (preferences: Partial<Consentements>) =>
    axios.put('/api/utilisateur/preferences', preferences),
};
