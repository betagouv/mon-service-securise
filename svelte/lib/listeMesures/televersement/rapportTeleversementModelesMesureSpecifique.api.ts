import type { RapportDetaille } from './rapportTeleversementModelesMesureSpecifique.types';

export const recupereRapportDetaille = async () => {
  try {
    const reponse = await axios.get<RapportDetaille>(
      '/api/televersement/modelesMesureSpecifique'
    );
    return reponse.data;
  } catch (e) {
    return;
  }
};
