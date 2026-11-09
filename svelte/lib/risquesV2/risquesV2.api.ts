import type {
  DonneesRisqueSpecifiqueV2,
  Niveau,
  TousRisques,
} from './risquesV2.d';

export const recupereRisques = async (idService: string) => {
  const donnees = await axios.get<TousRisques>(
    `/api/service/${idService}/risques/v2`
  );
  return donnees.data;
};

export const metsAJourRisque = async (
  idService: string,
  idRisque: string,
  {
    desactive,
    commentaire,
    gravite,
  }: { desactive: boolean; commentaire?: string; gravite?: Niveau }
) => {
  await axios.put(`/api/service/${idService}/risques/v2/${idRisque}`, {
    desactive,
    commentaire,
    graviteSurchargee: gravite,
  });
};

export const ajouteRisqueSpecifiqueV2 = async (
  idService: string,
  donnees: DonneesRisqueSpecifiqueV2
): Promise<{ id: string; identifiantNumerique: string }> => {
  return (
    await axios.post(
      `/api/service/${idService}/risques/v2/specifiques`,
      donnees
    )
  ).data;
};

export const metsAJourRisqueSpecifiqueV2 = async (
  idService: string,
  idRisque: string,
  donnees: DonneesRisqueSpecifiqueV2
) => {
  const { idModele: _, ...donneesMisesAJour } = donnees;
  await axios.put(
    `/api/service/${idService}/risques/v2/specifiques/${idRisque}`,
    donneesMisesAJour
  );
};

export const supprimeRisqueSpecifiqueV2 = async (
  idService: string,
  idRisque: string
) => {
  await axios.delete(
    `/api/service/${idService}/risques/v2/specifiques/${idRisque}`
  );
};
