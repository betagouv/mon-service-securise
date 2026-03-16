import type { TousRisques } from './risquesV2.d';

export const recupereRisques = async (idService: string) => {
  const donnees = await axios.get<TousRisques>(
    `/api/service/${idService}/risques/v2`
  );
  return donnees.data;
};

export const metsAJourRisque = async (
  idService: string,
  idRisque: string,
  desactive: boolean
) => {
  await axios.put(`/api/service/${idService}/risques/v2/${idRisque}`, {
    desactive,
  });
};
