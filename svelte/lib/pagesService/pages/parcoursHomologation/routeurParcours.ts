import {
  idEtapeParcoursHomologation,
  type IdEtapeParcoursHomologation,
} from './parcoursHomologation.types';

const estIdEtape = (valeur: string): valeur is IdEtapeParcoursHomologation =>
  (Object.values(idEtapeParcoursHomologation) as string[]).includes(valeur);

export const etapeDeURL = (url: string): IdEtapeParcoursHomologation => {
  const dernierSegment = url.split('/').filter(Boolean).at(-1);

  if (!dernierSegment || !estIdEtape(dernierSegment))
    throw new Error(
      `L'URL "${url}" ne correspond à aucune étape du parcours d'homologation.`
    );

  return dernierSegment;
};
