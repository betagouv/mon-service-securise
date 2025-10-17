import type { UUID } from '../typesBasiquesSvelte';
import type { BrouillonIncomplet } from './creationV2.types';
import type { NiveauSecurite } from '../../../donneesReferentielMesuresV2';
import type { IdNiveauDeSecurite } from '../ui/types';

export const creeBrouillonService = async (
  nomService: string
): Promise<UUID> => {
  const reponse = await axios.post<{ id: UUID }>('/api/brouillon-service', {
    nomService,
  });
  return reponse.data.id;
};

export const finaliseBrouillonService = async (
  idBrouillon: UUID
): Promise<UUID> => {
  const reponse = await axios.post<{ idService: UUID }>(
    `/api/brouillon-service/${idBrouillon}/finalise`
  );
  return reponse.data.idService;
};

export type MiseAJour = {
  [K in keyof BrouillonIncomplet]?: BrouillonIncomplet[K];
};

export const metsAJourBrouillonService = async (
  idBrouillon: UUID,
  donnees: MiseAJour
) => {
  const misesAJour = Object.entries(donnees);
  for (let i = 0; i < misesAJour.length; i++) {
    const [proprieteMiseAJour, valeurMiseAJour] = misesAJour[i];
    await axios.put(
      `/api/brouillon-service/${idBrouillon}/${proprieteMiseAJour}`,
      { [proprieteMiseAJour]: valeurMiseAJour }
    );
  }
};

export const lisBrouillonService = async (
  id: UUID
): Promise<BrouillonIncomplet> =>
  (await axios.get<BrouillonIncomplet>(`/api/brouillon-service/${id}`)).data;

export const niveauSecuriteMinimalRequis = async (
  id: UUID
): Promise<IdNiveauDeSecurite> =>
  (
    await axios.get<{ niveauDeSecuriteMinimal: NiveauSecurite }>(
      `/api/brouillon-service/${id}/niveauSecuriteRequis`
    )
  ).data.niveauDeSecuriteMinimal as IdNiveauDeSecurite;
