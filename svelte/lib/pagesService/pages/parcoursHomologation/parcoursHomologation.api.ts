import type { EtapeParcoursHomologation } from './parcoursHomologation.types';
import type {
  AutoriteHomologation,
  AvisHomologation,
} from '../homologuer/homologuer.types';

export const enregistrement = (idService: string) => ({
  autorite: async (autorite: AutoriteHomologation) =>
    await axios.put(
      `/api/service/${idService}/homologation/autorite`,
      autorite
    ),
  avis: async (avecAvis: boolean, avis: AvisHomologation[]) =>
    await axios.put(`/api/service/${idService}/homologation/avis`, {
      avecAvis,
      avis,
    }),
});

export const reprendsParcours = async (
  idService: string,
  etapeDemandee: EtapeParcoursHomologation
) => {
  const reponse = await axios.post(
    `/api/service/${idService}/homologation/reprends`,
    { etapeDemandee }
  );
  return reponse.data.etapeAAfficher;
};
