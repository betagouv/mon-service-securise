import type { EtapeParcoursHomologation } from './parcoursHomologation.types';
import type { AutoriteHomologation } from '../homologuer/homologuer.types';

export async function enregistreAutorite(
  idService: string,
  autorite: AutoriteHomologation
) {
  await axios.put(`/api/service/${idService}/homologation/autorite`, autorite);
}

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
