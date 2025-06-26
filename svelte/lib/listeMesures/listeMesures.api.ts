import type { StatutMesure } from '../modeles/modeleMesure';

export const enregistreModificationMesureSurServicesMultiples = async ({
  idMesure,
  idsServices,
  statut,
  modalites,
}: {
  idMesure: string;
  idsServices: string[];
  statut: StatutMesure | null;
  modalites: string | null;
}) => {
  await axios.put(`/api/services/mesures/${idMesure}`, {
    idsServices,
    statut,
    modalites,
  });
};
