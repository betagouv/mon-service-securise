import type { Mesures } from './tableauDesMesures.d';

export const recupereMesures = async (idService: string) => {
  const reponse = await axios.get(`/api/service/${idService}/mesures`);
  return reponse.data as Mesures;
};
