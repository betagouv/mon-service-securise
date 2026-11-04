import type {
  Consentements,
  PreferencesRecapitulatif,
} from './preferences.types';

export const api = {
  sauvegardePreferencesConsentements: async (
    consentements: Partial<Consentements>
  ) => axios.put('/api/utilisateur/preferences/consentements', consentements),
  sauvegardePreferencesRecapitulatif: async (
    recapitulatif: Partial<PreferencesRecapitulatif>
  ) => axios.put('/api/utilisateur/preferences/recapitulatif', recapitulatif),
  recuperePreferencesRecapitulatif:
    async (): Promise<PreferencesRecapitulatif> =>
      (await axios.get('/api/utilisateur/preferences/recapitulatif')).data,
};
