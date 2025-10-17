import type { Entite } from './types.d';

export const rechercheOrganisation = async (
  siret: string
): Promise<Entite[]> => {
  const reponse = await axios.get<{ suggestions: Entite[] }>(
    '/api/annuaire/organisations',
    { params: { recherche: siret } }
  );

  return reponse.data.suggestions;
};

export const metEnFormeEntite = (entite: Entite) => {
  const siret = entite.siret;
  /* eslint-disable no-irregular-whitespace */
  const siretFormatte =
    siret &&
    `${siret.substring(0, 3)} ${siret.substring(3, 6)} ${siret.substring(
      6,
      9
    )} ${siret.substring(9, 14)}`;
  return `(${entite.departement}) ${entite.nom} - ${siretFormatte}`;
};
