import { RisquesV2 } from '../../moteurRisques/v2/risquesV2.js';
import { Gravite } from '../../moteurRisques/v2/graviteObjectifsVises.js';
import { Vraisemblance } from '../../moteurRisques/v2/vraisemblance/vraisemblance.types.js';

export type NiveauDeRisque = 'faible' | 'moyen' | 'eleve' | 'nonEvalue';

const estRenseigne = (valeur: number) => valeur > 0;

const niveauDeRisque = (
  gravite: Gravite,
  vraisemblance: Vraisemblance
): NiveauDeRisque => {
  if (!estRenseigne(gravite) || !estRenseigne(vraisemblance))
    return 'nonEvalue';
  const criticite = gravite * vraisemblance;
  if (criticite <= 4 && vraisemblance < 3 && gravite < 4) return 'faible';
  if (criticite >= 8 && vraisemblance > 2 && gravite >= 2) return 'eleve';
  return 'moyen';
};

export type RisqueCartographie = {
  identifiant: string;
  intitule: string;
  gravite: Gravite;
  vraisemblance: Vraisemblance;
  niveau: NiveauDeRisque;
};

export type CartographiesDesRisques = {
  bruts: RisqueCartographie[];
  aDate: RisqueCartographie[];
  cibles: RisqueCartographie[];
};

const placeLeRisque = (
  identifiant: string,
  intitule: string,
  gravite: Gravite,
  vraisemblance: Vraisemblance
): RisqueCartographie => ({
  identifiant,
  intitule,
  gravite,
  vraisemblance,
  niveau: niveauDeRisque(gravite, vraisemblance),
});

type JSONRisques = ReturnType<RisquesV2['toJSON']>;

const risquesGenerauxActifs = (risques: JSONRisques['risques']) =>
  risques
    .filter(({ desactive }) => !desactive)
    .map(({ id, intitule, gravite, vraisemblance }) =>
      placeLeRisque(id, intitule, gravite, vraisemblance)
    );

const risquesSpecifiquesBruts = (
  risquesSpecifiques: JSONRisques['risquesSpecifiques']
) =>
  risquesSpecifiques.map(
    ({ identifiantNumerique, intitule, graviteBrute, vraisemblanceBrute }) =>
      placeLeRisque(
        identifiantNumerique,
        intitule,
        graviteBrute,
        vraisemblanceBrute
      )
  );

const risquesSpecifiquesADate = (
  risquesSpecifiques: JSONRisques['risquesSpecifiques']
) =>
  risquesSpecifiques.map(
    ({ identifiantNumerique, intitule, gravite, vraisemblance }) =>
      placeLeRisque(identifiantNumerique, intitule, gravite, vraisemblance)
  );

export const cartographiesDesRisques = (
  risquesV2: RisquesV2
): CartographiesDesRisques => {
  const { risques, risquesBruts, risquesCibles, risquesSpecifiques } =
    risquesV2.toJSON();
  return {
    bruts: [
      ...risquesGenerauxActifs(risquesBruts),
      ...risquesSpecifiquesBruts(risquesSpecifiques),
    ],
    aDate: [
      ...risquesGenerauxActifs(risques),
      ...risquesSpecifiquesADate(risquesSpecifiques),
    ],
    cibles: [
      ...risquesGenerauxActifs(risquesCibles),
      ...risquesSpecifiquesADate(risquesSpecifiques),
    ],
  };
};
