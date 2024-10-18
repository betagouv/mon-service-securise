import type { Risque } from './risques.d';

export const enregistreRisque = async (idService: string, risque: Risque) => {
  if (risque.type === 'GENERAL') {
    await axios.put(`/api/service/${idService}/risques/${risque.id}`, {
      niveauGravite: risque.niveauGravite,
      commentaire: risque.commentaire,
      niveauVraisemblance: risque.niveauVraisemblance,
    });
  } else {
    await axios.put(
      `/api/service/${idService}/risquesSpecifiques/${risque.id}`,
      {
        niveauGravite: risque.niveauGravite,
        niveauVraisemblance: risque.niveauVraisemblance,
        commentaire: risque.commentaire,
        intitule: risque.intitule,
        categories: risque.categories,
        description: risque.description,
      }
    );
  }
};

export const ajouteRisqueSpecifique = async (
  idService: string,
  risque: Risque
) => {
  await axios.post(`/api/service/${idService}/risquesSpecifiques`, {
    niveauGravite: risque.niveauGravite,
    niveauVraisemblance: risque.niveauVraisemblance,
    commentaire: risque.commentaire,
    intitule: risque.intitule,
    categories: risque.categories,
    description: risque.description,
  });
};

export const supprimeRisqueSpecifique = async (
  idService: string,
  risque: Risque
) => {
  await axios.delete(
    `/api/service/${idService}/risquesSpecifiques/${risque.id}`
  );
};
