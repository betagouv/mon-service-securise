import type {
  Consentements,
  RecapitulatifHebdomadaire,
} from './preferences.types';

export const api = {
  sauvegardePreferencesConsentements: async (
    consentements: Partial<Consentements>
  ) => axios.put('/api/utilisateur/preferences/consentements', consentements),
  sauvegardePreferencesRecapitulatif: async (
    recapitulatif: Partial<RecapitulatifHebdomadaire>
  ) => axios.put('/api/utilisateur/preferences/recapitulatif', recapitulatif),
};
