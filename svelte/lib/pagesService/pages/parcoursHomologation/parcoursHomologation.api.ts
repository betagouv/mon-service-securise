import type { IdEtapeParcoursHomologation } from './parcoursHomologation.types';
import type {
  AutoriteHomologation,
  AvisHomologation,
  DecisionHomologation,
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
  decision: async (donnees: DecisionHomologation) => {
    const { dateHomologation, dureeValidite, refusee } = donnees;

    const payload = refusee
      ? { refusee, dateHomologation }
      : { dureeValidite, dateHomologation };

    return await axios.put(
      `/api/service/${idService}/homologation/decision`,
      payload
    );
  },
  documents: async (avecDocuments: boolean, documents: string[]) =>
    await axios.put(`/api/service/${idService}/homologation/documents`, {
      avecDocuments,
      documents,
    }),
  telechargement: async () =>
    await axios.put(`/api/service/${idService}/homologation/telechargement`),
});

export const reprendsParcours = async (
  idService: string,
  etapeDemandee: IdEtapeParcoursHomologation
) => {
  const reponse = await axios.post(
    `/api/service/${idService}/homologation/reprends`,
    { etapeDemandee }
  );
  return reponse.data.etapeAAfficher;
};
