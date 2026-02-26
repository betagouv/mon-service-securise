import type { Niveau, TousRisques } from './risquesV2.d';

type RisqueSpecifiqueAPI = {
  id: string;
  intitule: string;
  categories: string[];
  commentaire: string;
  description: string;
  identifiantNumerique: string;
  niveauGravite: string;
  niveauRisque: string;
  niveauVraisemblance: string;
  type: 'SPECIFIQUE';
};

const mapRisqueSpecifique: {
  gravite: Record<string, Niveau>;
  vraisemblance: Record<string, Niveau>;
} = {
  gravite: { minime: 1, significatif: 2, grave: 3, critique: 4 },
  vraisemblance: {
    invraisemblable: 1, // TODO : les spécifiques ont aussi un niveau 0… donc ici ne pas mapper vers 1.
    peuVraisemblable: 1,
    vraisemblable: 2,
    tresVraisemblable: 3,
    quasiCertain: 4,
  },
};

export const recupereRisques = async (idService: string) => {
  const donnees = await axios.get<TousRisques>(
    `/api/service/${idService}/risques/v2`
  );

  donnees.data.risquesBruts.forEach((r) => (r.type = 'GENERAL'));
  donnees.data.risques.forEach((r) => (r.type = 'GENERAL'));
  donnees.data.risquesCibles.forEach((r) => (r.type = 'GENERAL'));

  donnees.data.risquesSpecifiques
    .map((r) => r as unknown as RisqueSpecifiqueAPI)
    .forEach((r) => {
      r.type = 'SPECIFIQUE';
      // @ts-ignore
      r.gravite = mapRisqueSpecifique.gravite[r.niveauGravite];
      // @ts-ignore
      r.vraisemblance =
        mapRisqueSpecifique.vraisemblance[r.niveauVraisemblance];
    });

  return donnees.data;
};
