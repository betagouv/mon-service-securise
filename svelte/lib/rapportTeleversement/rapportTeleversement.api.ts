import type { RapportDetaille } from './rapportTeleversement.types';

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
