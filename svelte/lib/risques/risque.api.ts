import type { Risque } from './risques.d';
import {
  convertisDonneesRisqueGeneral,
  convertisDonneesRisqueSpecifique,
} from './risques';

export const enregistreRisque = async (
  idService: string,
  risque: Risque
): Promise<Risque> => {
  if (risque.type === 'GENERAL') {
    const reponse = await axios.put(
      `/api/service/${idService}/risques/${risque.id}`,
      {
        niveauGravite: risque.niveauGravite,
        commentaire: risque.commentaire,
        niveauVraisemblance: risque.niveauVraisemblance,
        desactive: risque.desactive,
      }
    );
    return convertisDonneesRisqueGeneral(reponse.data);
  } else {
    const reponse = await axios.put(
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
    return convertisDonneesRisqueSpecifique(reponse.data);
  }
};

export const ajouteRisqueSpecifique = async (
  idService: string,
  risque: Risque
): Promise<Risque> => {
  const reponse = await axios.post(
    `/api/service/${idService}/risquesSpecifiques`,
    {
      niveauGravite: risque.niveauGravite,
      niveauVraisemblance: risque.niveauVraisemblance,
      commentaire: risque.commentaire,
      intitule: risque.intitule,
      categories: risque.categories,
      description: risque.description,
    }
  );
  return convertisDonneesRisqueSpecifique(reponse.data);
};

export const supprimeRisqueSpecifique = async (
  idService: string,
  risque: Risque
) => {
  await axios.delete(
    `/api/service/${idService}/risquesSpecifiques/${risque.id}`
  );
};
