import type { Risque } from './risques.d';

export const enregistreRisque = async (idService: string, risque: Risque) => {
  if (risque.type === 'GENERAL') {
    await axios.put(`/api/service/${idService}/risques/${risque.id}`, {
      niveauGravite: risque.niveauGravite,
      commentaire: risque.commentaire,
    });
  } else {
    await axios.put(
      `/api/service/${idService}/risquesSpecifiques/${risque.id}`,
      {
        niveauGravite: risque.niveauGravite,
        commentaire: risque.commentaire,
        intitule: risque.intitule,
        categories: risque.categories,
        description: risque.description,
      }
    );
  }
};
