import type { UUID } from '../typesBasiquesSvelte';
import type { BrouillonIncomplet } from './creationV2.types';

export const creeBrouillonService = async (
  nomService: string
): Promise<UUID> => {
  const reponse = await axios.post('/api/brouillon-service', { nomService });
  return reponse.data.id as UUID;
};

export const finaliseBrouillonService = async (idBrouillon: UUID) =>
  await axios.post(`/api/brouillon-service/${idBrouillon}/finalise`);

export type MiseAJour = Partial<
  Record<keyof BrouillonIncomplet, string | string[]>
>;

export const metsAJourBrouillonService = async (
  idBrouillon: UUID,
  donnees: MiseAJour
) => {
  await Promise.all(
    Object.entries(donnees).map(([clePropriete, valeur]) =>
      axios.put(`/api/brouillon-service/${idBrouillon}/${clePropriete}`, {
        [clePropriete]: valeur,
      })
    )
  );
};

export const lisBrouillonService = async (
  id: UUID
): Promise<BrouillonIncomplet> =>
  (await axios.get<BrouillonIncomplet>(`/api/brouillon-service/${id}`)).data;
