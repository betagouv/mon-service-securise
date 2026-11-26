import { TousReferentiels } from '../referentiel.interface.js';
import { CategorieMesure, DonneesIndiceCyber } from './indiceCyber.type.js';

export type StatistiquesCategorie = {
  total: number;
  fait: number;
  enCours: number;
};

type StatistiquesParCategorie = Record<CategorieMesure, StatistiquesCategorie>;

export type StatistiquesParTypeEtParCategorie = {
  indispensables: StatistiquesParCategorie;
  recommandees: StatistiquesParCategorie;
};

const tauxDeCategorie = (
  indispensables: StatistiquesCategorie,
  recommandees: StatistiquesCategorie,
  referentiel: TousReferentiels
): number => {
  const coeff = {
    indispensables: referentiel.coefficientIndiceCyberMesuresIndispensables(),
    recommandees: referentiel.coefficientIndiceCyberMesuresRecommandees(),
    statutPartiel: referentiel.coefficientIndiceCyberStatutPartiel(),
  };

  const fractionIndispensables =
    indispensables.fait + indispensables.enCours * coeff.statutPartiel;
  const fractionRecommandees =
    recommandees.fait + recommandees.enCours * coeff.statutPartiel;

  if (recommandees.total === 0 && indispensables.total === 0) return 0;
  if (recommandees.total === 0)
    return fractionIndispensables / indispensables.total;
  if (indispensables.total === 0)
    return fractionRecommandees / recommandees.total;
  return (
    (coeff.indispensables +
      coeff.recommandees * (fractionRecommandees / recommandees.total)) *
    (fractionIndispensables / indispensables.total)
  );
};

const parCategorie = (
  categories: CategorieMesure[],
  valeur: (categorie: CategorieMesure) => number
) =>
  Object.fromEntries(
    categories.map((categorie) => [categorie, valeur(categorie)])
  ) as Record<CategorieMesure, number>;

class IndiceCyber {
  private readonly tauxParCategorie: Record<CategorieMesure, number>;
  private readonly scoreToutesCategories: DonneesIndiceCyber;

  constructor(
    statistiquesParTypeEtParCategorie: StatistiquesParTypeEtParCategorie,
    referentiel: TousReferentiels
  ) {
    const toutesCategories =
      referentiel.identifiantsCategoriesMesures() as CategorieMesure[];
    const { indispensables, recommandees } = statistiquesParTypeEtParCategorie;

    this.tauxParCategorie = parCategorie(toutesCategories, (categorie) =>
      tauxDeCategorie(
        indispensables[categorie],
        recommandees[categorie],
        referentiel
      )
    );

    const nbMesures = (categorie: CategorieMesure) =>
      indispensables[categorie].total + recommandees[categorie].total;
    const scorePondere = (categorie: CategorieMesure) =>
      nbMesures(categorie) * this.tauxDeLaCategorie(categorie);
    const totalPondere = toutesCategories.reduce(
      (acc, categorie) => acc + scorePondere(categorie),
      0
    );
    const nbTotalMesures = toutesCategories.reduce(
      (acc, categorie) => acc + nbMesures(categorie),
      0
    );
    const indiceCyberNoteMax = referentiel.indiceCyberNoteMax();
    const indiceTotal = nbTotalMesures
      ? indiceCyberNoteMax * (totalPondere / nbTotalMesures)
      : 0;

    this.scoreToutesCategories = {
      total: indiceTotal,
      ...parCategorie(
        toutesCategories,
        (categorie) => indiceCyberNoteMax * this.tauxDeLaCategorie(categorie)
      ),
    };
  }

  tauxDeLaCategorie(idCategorie: CategorieMesure): number {
    return this.tauxParCategorie[idCategorie];
  }

  indiceCyber(): DonneesIndiceCyber {
    return this.scoreToutesCategories;
  }
}

export { IndiceCyber };
