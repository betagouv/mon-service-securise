import type { RapportDetaille } from './rapportTeleversementServices.types';
import type { RapportDetailleV2 } from './rapportTeleversementServicesV2.types';

export const recupereRapportDetaille = async () => {
  try {
    const reponse = await axios.get<RapportDetaille>(
      '/api/televersement/services'
    );
    return reponse.data;
  } catch (e) {
    return;
  }
};

export const supprimeTeleversement = async () =>
  axios.delete('/api/televersement/services');

export const confirmeImport = async () =>
  axios.post('/api/televersement/services/confirme');

export const progressionTeleversement = async () =>
  axios.get<{ progression: number }>('/api/televersement/services/progression');

export const recupereRapportDetailleV2 = async () => {
  try {
    const reponse = await axios.get<RapportDetailleV2>(
      '/api/televersement/services-v2'
    );
    return reponse.data;
  } catch (e) {
    return;
  }
};

export const confirmeImportV2 = async () =>
  axios.post('/api/televersement/services-v2/confirme');

export const progressionTeleversementV2 = async () =>
  axios.get<{ progression: number }>(
    '/api/televersement/services-v2/progression'
  );

export const supprimeTeleversementV2 = async () =>
  axios.delete('/api/televersement/services-v2');
