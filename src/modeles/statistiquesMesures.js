const Referentiel = require('../referentiel');
const { ErreurCategorieInconnue, ErreurDonneesStatistiques } = require('../erreurs');

const categories = Object.keys;
const statistiques = Object.values;

const valide = (donnees, referentiel) => {
  const categoriesRepertoriees = referentiel.identifiantsCategoriesMesures();
  const categorieNonRepertoriee = categories(donnees)
    .find((c) => !categoriesRepertoriees.includes(c));

  if (categorieNonRepertoriee) {
    throw new ErreurCategorieInconnue(
      `La catégorie "${categorieNonRepertoriee}" n'est pas répertoriée`
    );
  }

  const statistiquesIncoherentes = statistiques(donnees).find(
    ({ retenues, misesEnOeuvre }) => typeof misesEnOeuvre === 'undefined'
      || typeof retenues === 'undefined' || misesEnOeuvre > retenues
  );

  if (statistiquesIncoherentes) {
    throw new ErreurDonneesStatistiques(
      'Les mesures mises en œuvre ne peuvent pas être supérieures en nombre aux mesures retenues '
      + `(nombre inférieur à ${statistiquesIncoherentes.retenues} attendu, `
      + `${statistiquesIncoherentes.misesEnOeuvre} spécifié)`
    );
  }
};

class StatistiquesMesures {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    valide(donnees, referentiel);
    this.donnees = donnees;
    this.referentiel = referentiel;
  }

  categories() {
    return categories(this.donnees);
  }

  indiceCyber() {
    const nbMesures = (categorie) => {
      const { totalIndispensables, totalRecommandees } = this.donnees[categorie];
      return totalIndispensables + totalRecommandees;
    };

    const totalPondere = this.categories().reduce((acc, categorie) => (
      acc + nbMesures(categorie) * this.score(categorie)
    ), 0);

    const nbTotalMesures = this.categories().reduce((acc, categorie) => (
      acc + nbMesures(categorie)
    ), 0);

    const indiceTotal = this.referentiel.indiceCyberNoteMax() * (totalPondere / nbTotalMesures);

    return this.categories().reduce((acc, categorie) => Object.assign(acc, {
      [categorie]: this.referentiel.indiceCyberNoteMax() * this.score(categorie),
    }), { total: indiceTotal });
  }

  misesEnOeuvre(idCategorie) {
    return this.donnees[idCategorie].misesEnOeuvre;
  }

  retenues(idCategorie) {
    return this.donnees[idCategorie].retenues;
  }

  score(idCategorie) {
    const {
      recommandeesFaites,
      indispensablesFaites,
      totalRecommandees,
      totalIndispensables,
    } = this.donnees[idCategorie];

    if (totalRecommandees === 0) return indispensablesFaites / totalIndispensables;
    if (totalIndispensables === 0) return recommandeesFaites / totalRecommandees;

    const coeffIndispensables = this.referentiel.coefficientIndiceCyberMesuresIndispensables();
    const coeffRecommandees = this.referentiel.coefficientIndiceCyberMesuresRecommandees();

    return (coeffIndispensables + coeffRecommandees * (recommandeesFaites / totalRecommandees))
      * (indispensablesFaites / totalIndispensables);
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.donnees));
  }

  totalIndispensables() {
    return this.categories()
      .map((categorie) => (this.donnees[categorie].totalIndispensables))
      .reduce((acc, total) => (acc + total), 0);
  }
}

module.exports = StatistiquesMesures;
