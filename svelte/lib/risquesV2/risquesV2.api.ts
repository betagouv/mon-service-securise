import type { RisqueSpecifiqueV2, TousRisques } from './risquesV2.d';

export const recupereRisques = async (idService: string) => {
  const donnees = await axios.get<TousRisques>(
    `/api/service/${idService}/risques/v2`
  );
  return donnees.data;
};

export const metsAJourRisque = async (
  idService: string,
  idRisque: string,
  { desactive, commentaire }: { desactive: boolean; commentaire?: string }
) => {
  await axios.put(`/api/service/${idService}/risques/v2/${idRisque}`, {
    desactive,
    commentaire,
  });
};

export const ajouteRisqueSpecifiqueV2 = async (
  idService: string,
  donnees: RisqueSpecifiqueV2
) => {
  await axios.post(`/api/service/${idService}/risques/v2/specifiques`, donnees);
};
