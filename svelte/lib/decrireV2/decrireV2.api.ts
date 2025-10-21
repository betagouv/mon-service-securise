import type { IdNiveauDeSecurite } from '../ui/types';
import type { NiveauSecurite } from '../../../donneesReferentielMesuresV2';
import type { DescriptionServiceV2 } from '../creationV2/creationV2.types';
import type { UUID } from '../typesBasiquesSvelte';

export const niveauSecuriteMinimalRequis = async ({
  siret,
  ...donnees
}: DescriptionServiceV2): Promise<IdNiveauDeSecurite> => {
  const donneesAPI = {
    ...donnees,
    organisationResponsable: { siret: siret },
    pointsAcces: donnees.pointsAcces.map((p) => ({ description: p })),
  };
  return (
    await axios.post<{ niveauDeSecuriteMinimal: NiveauSecurite }>(
      `/api/service-v2/niveauSecuriteRequis`,
      donneesAPI
    )
  ).data.niveauDeSecuriteMinimal as IdNiveauDeSecurite;
};

export const metsAJourDescriptionService = async (
  idService: UUID,
  { siret, ...donnees }: DescriptionServiceV2
): Promise<void> => {
  const donneesAPI = {
    ...donnees,
    organisationResponsable: { siret: siret },
    pointsAcces: donnees.pointsAcces.map((p) => ({ description: p })),
  };
  return await axios.put(`/api/service-v2/${idService}`, donneesAPI);
};
