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
  await axios.put(`/api/services/mesuresGenerales/${idMesure}`, {
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
}): Promise<string> => {
  const reponse = await axios.post(`/api/modeles/mesureSpecifique`, {
    description,
    descriptionLongue,
    categorie,
  });
  return reponse.data?.id;
};

export const sauvegardeModeleMesureSpecifique = async ({
  id,
  description,
  descriptionLongue,
  categorie,
}: {
  id: string;
  description: string;
  descriptionLongue: string;
  categorie: string;
}) => {
  await axios.put(`/api/modeles/mesureSpecifique/${id}`, {
    description,
    descriptionLongue,
    categorie,
  });
};

export const associeServicesModeleMesureSpecifique = async (
  idMesure: string,
  idsServicesAAssocier: string[]
) => {
  await axios.put(`/api/modeles/mesureSpecifique/${idMesure}/services`, {
    idsServicesAAssocier,
  });
};
