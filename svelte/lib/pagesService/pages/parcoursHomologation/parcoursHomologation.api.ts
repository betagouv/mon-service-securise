import type { EtapeParcoursHomologation } from './parcoursHomologation.types';

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
