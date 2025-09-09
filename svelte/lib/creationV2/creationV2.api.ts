import type { UUID } from '../typesBasiquesSvelte';

export const creeBrouillonService = async (
  nomService: string
): Promise<UUID> => {
  const reponse = await axios.post('/api/brouillon-service', { nomService });
  return reponse.data.id as UUID;
};

export const finaliseBrouillonService = async (idBrouillon: UUID) =>
  await axios.post(`/api/brouillon-service/${idBrouillon}/finalise`);

export const metsAJourBrouillonService = async (
  idBrouillon: UUID,
  clePropriete: string,
  valeur: string
) =>
  await axios.put(`/api/brouillon-service/${idBrouillon}/${clePropriete}`, {
    [clePropriete]: valeur,
  });
