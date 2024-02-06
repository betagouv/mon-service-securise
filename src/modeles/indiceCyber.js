const tauxDeCategorie = (
  statsIndispensables,
  statsRecommandees,
  referentiel
) => {
  const coeff = {
    indispensables: referentiel.coefficientIndiceCyberMesuresIndispensables(),
    recommandees: referentiel.coefficientIndiceCyberMesuresRecommandees(),
  };
  const indispensables = statsIndispensables;
  const recommandees = statsRecommandees;

  let score;
  if (recommandees.total === 0)
    score = indispensables.fait / indispensables.total;
  else if (indispensables.total === 0)
    score = recommandees.fait / recommandees.total;
  else
    score =
      (coeff.indispensables +
        coeff.recommandees * (recommandees.fait / recommandees.total)) *
      (indispensables.fait / indispensables.total);

  return score;
};

class IndiceCyber {
  constructor(statistiquesParTypeEtParCategorie, referentiel) {
    this.tauxParCategorie = {};

    const toutesCategories = referentiel.identifiantsCategoriesMesures();

    toutesCategories.forEach((categorie) => {
      this.tauxParCategorie[categorie] = tauxDeCategorie(
        statistiquesParTypeEtParCategorie.indispensables[categorie],
        statistiquesParTypeEtParCategorie.recommandees[categorie],
        referentiel
      );
    });

    const { indispensables, recommandees } = statistiquesParTypeEtParCategorie;
    const nbMesures = (categorie) =>
      indispensables[categorie].total + recommandees[categorie].total;
    const scorePondere = (categorie) =>
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
    const indiceTotal = indiceCyberNoteMax * (totalPondere / nbTotalMesures);

    this.scoreToutesCategories = toutesCategories.reduce(
      (acc, categorie) => ({
        ...acc,
        [categorie]: indiceCyberNoteMax * this.tauxDeLaCategorie(categorie),
      }),
      { total: indiceTotal }
    );
  }

  tauxDeLaCategorie(idCategorie) {
    return this.tauxParCategorie[idCategorie];
  }

  indiceCyber() {
    return this.scoreToutesCategories;
  }
}

module.exports = { IndiceCyber };
