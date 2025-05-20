import type { RapportDetaille } from './rapportTeleversement.d';

export const recuperRapportDetaille = async () => {
  try {
    const reponse = await axios.get<RapportDetaille>(
      '/api/televersement/services'
    );
    return reponse.data;
  } catch (e) {
    return;
  }
};
