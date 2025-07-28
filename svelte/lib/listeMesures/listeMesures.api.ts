import type { StatutMesure } from '../modeles/modeleMesure';

export const enregistreModificationMesureSurServicesMultiples = async ({
  idMesure,
  idsServices,
  statut,
  modalites,
}: {
  idMesure: string;
  idsServices: string[];
  statut: StatutMesure | '';
  modalites: string | null;
}) => {
  await axios.put(`/api/services/mesures/${idMesure}`, {
    idsServices,
    statut,
    modalites,
  });
};

export const ajouteModeleMesureSpecifique = async ({
  description,
  descriptionLongue,
  categorie,
}: {
  description: string;
  descriptionLongue: string;
  categorie: string;
}) => {
  await axios.post(`/api/modeles/mesureSpecifique`, {
    description,
    descriptionLongue,
    categorie,
  });
};
