const Mesure = require('./mesure');

const {
  ErreurCategorieInconnue,
  ErreurDonneesStatistiques,
} = require('../erreurs');

const categories = Object.keys;
const statistiques = Object.values;

const valide = (donnees, referentiel) => {
  const categoriesRepertoriees = referentiel.identifiantsCategoriesMesures();
  const categorieNonRepertoriee = categories(donnees).find(
    (c) => !categoriesRepertoriees.includes(c)
  );

  if (categorieNonRepertoriee) {
    throw new ErreurCategorieInconnue(
      `La catégorie "${categorieNonRepertoriee}" n'est pas répertoriée`
    );
  }

  const statistiquesIncoherentes = statistiques(donnees).find(
    ({ retenues, misesEnOeuvre }) =>
      typeof misesEnOeuvre === 'undefined' ||
      typeof retenues === 'undefined' ||
      misesEnOeuvre > retenues
  );

  if (statistiquesIncoherentes) {
    throw new ErreurDonneesStatistiques(
      'Les mesures mises en œuvre ne peuvent pas être supérieures en nombre aux mesures retenues ' +
        `(nombre inférieur à ${statistiquesIncoherentes.retenues} attendu, ` +
        `${statistiquesIncoherentes.misesEnOeuvre} spécifié)`
    );
  }
};

class StatistiquesMesures {
  static donneesAZero(statuts, identifiantsCategoriesMesures) {
    const statutsAZero = () =>
      statuts.reduce((acc, statut) => ({ ...acc, [statut]: 0 }), { total: 0 });

    const statsInitiales = () => ({
      indispensables: statutsAZero(),
      recommandees: statutsAZero(),
      misesEnOeuvre: 0,
      retenues: 0,
    });

    return identifiantsCategoriesMesures.reduce(
      (acc, categorie) => ({ ...acc, [categorie]: statsInitiales() }),
      {}
    );
  }

  constructor(donnees, referentiel, mesuresSpecifiques) {
    valide(donnees, referentiel);
    this.donnees = donnees;
    this.referentiel = referentiel;
    this.mesuresSpecifiques = mesuresSpecifiques;
  }

  aRemplir(idCategorie) {
    const total =
      this.donnees[idCategorie].indispensables.total +
      this.donnees[idCategorie].recommandees.total;
    return (
      total -
      this.misesEnOeuvre(idCategorie) -
      this.enCours(idCategorie) -
      this.nonFaites(idCategorie)
    );
  }

  aRemplirToutesCategories() {
    return this.categories().reduce(
      (total, categorie) => total + this.aRemplir(categorie),
      0
    );
  }

  categories() {
    return categories(this.donnees);
  }

  completude() {
    const nombreTotalMesures =
      this.indispensables().total +
      this.recommandees().total +
      this.mesuresSpecifiques.nombre();

    const nombreMesuresCompletes =
      nombreTotalMesures -
      this.aRemplirToutesCategories() -
      this.mesuresSpecifiques.nombreDeSansStatut();

    return { nombreTotalMesures, nombreMesuresCompletes };
  }

  enCours(idCategorie) {
    const stats = this.donnees[idCategorie];
    return stats.retenues - stats.misesEnOeuvre;
  }

  filtreesParType(type) {
    const totalToutesCategories = (statut) =>
      this.categories()
        .map((categorie) => this.donnees[categorie][type][statut])
        .reduce((acc, total) => acc + total, 0);

    const resultat = [...Mesure.statutsPossibles(), 'total'].reduce(
      (acc, statut) =>
        Object.assign(acc, { [statut]: totalToutesCategories(statut) }),
      {}
    );

    resultat.restant = resultat.total - resultat.fait;
    resultat.aRemplir =
      resultat.total - resultat.fait - resultat.enCours - resultat.nonFait;

    return resultat;
  }

  indispensables() {
    return this.filtreesParType('indispensables');
  }

  misesEnOeuvre(idCategorie) {
    return this.donnees[idCategorie].misesEnOeuvre;
  }

  nonFaites(idCategorie) {
    const stats = this.donnees[idCategorie];
    return stats.indispensables.nonFait + stats.recommandees.nonFait;
  }

  recommandees() {
    return this.filtreesParType('recommandees');
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.donnees));
  }
}

module.exports = StatistiquesMesures;
