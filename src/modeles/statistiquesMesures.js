const Referentiel = require('../referentiel');
const { ErreurCategorieInconnue, ErreurDonneesStatistiques } = require('../erreurs');

const categories = Object.keys;
const statistiques = Object.values;

const PRECISION = { NOMBRE_CHIFFRES_APRES_VIRGULE: 1 };

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

  indiceSecurite() {
    const nbMesures = (categorie) => {
      const { totalIndispensables, totalRecommandees } = this.donnees[categorie];
      return totalIndispensables + totalRecommandees;
    };

    const arrondis = (n, precision) => {
      const arrondiEntier = Math.round(`${n}e${precision}`);
      return Number(`${arrondiEntier}e-${precision}`);
    };

    const totalPondere = this.categories().reduce((acc, categorie) => (
      acc + nbMesures(categorie) * this.score(categorie)
    ), 0);

    const nbTotalMesures = this.categories().reduce((acc, categorie) => (
      acc + nbMesures(categorie)
    ), 0);

    const indiceTotalBrut = this.referentiel.indiceSecuriteMax() * (totalPondere / nbTotalMesures);
    const indiceTotal = arrondis(indiceTotalBrut, PRECISION.NOMBRE_CHIFFRES_APRES_VIRGULE);

    return this.categories().reduce((acc, categorie) => {
      const scoreBrut = this.referentiel.indiceSecuriteMax() * this.score(categorie);
      return Object.assign(
        acc,
        { [categorie]: arrondis(scoreBrut, PRECISION.NOMBRE_CHIFFRES_APRES_VIRGULE) },
      );
    }, { total: indiceTotal });
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

    const coeffIndispensables = this.referentiel.coefficientIndiceSecuriteMesuresIndispensables();
    const coeffRecommandees = this.referentiel.coefficientIndiceSecuriteMesuresRecommandees();

    return (coeffIndispensables + coeffRecommandees * (recommandeesFaites / totalRecommandees))
      * (indispensablesFaites / totalIndispensables);
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.donnees));
  }
}

Object.assign(StatistiquesMesures, PRECISION);
module.exports = StatistiquesMesures;
