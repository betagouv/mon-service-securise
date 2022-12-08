const Mesure = require('./mesure');

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
  static donneesAZero(statuts, identifiantsCategoriesMesures) {
    const statutsAZero = () => statuts
      .reduce((acc, statut) => ({ ...acc, [statut]: 0 }), { total: 0 });

    const statsInitiales = () => ({
      indispensables: statutsAZero(),
      recommandees: statutsAZero(),
      misesEnOeuvre: 0,
      retenues: 0,
    });

    return identifiantsCategoriesMesures
      .reduce((acc, categorie) => ({ ...acc, [categorie]: statsInitiales() }), {});
  }

  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide(), mesuresSpecifiques) {
    valide(donnees, referentiel);
    this.donnees = donnees;
    this.referentiel = referentiel;
    this.mesuresSpecifiques = mesuresSpecifiques;
  }

  aRemplir(idCategorie) {
    const total = this.donnees[idCategorie].indispensables.total
      + this.donnees[idCategorie].recommandees.total;
    return total
      - this.misesEnOeuvre(idCategorie)
      - this.enCours(idCategorie)
      - this.nonFaites(idCategorie);
  }

  aRemplirToutesCategories() {
    return this.categories()
      .reduce((total, categorie) => total + this.aRemplir(categorie), 0);
  }

  categories() {
    return categories(this.donnees);
  }

  completude() {
    const nombreTotalMesures = this.indispensables().total
        + this.recommandees().total
        + this.mesuresSpecifiques.nombre();

    const nombreMesuresCompletes = nombreTotalMesures
        - this.aRemplirToutesCategories()
        - this.mesuresSpecifiques.nombreDeSansStatut();

    return { nombreTotalMesures, nombreMesuresCompletes };
  }

  enCours(idCategorie) {
    const stats = this.donnees[idCategorie];
    return stats.retenues - stats.misesEnOeuvre;
  }

  filtreesParType(type) {
    const totalToutesCategories = (statut) => this.categories()
      .map((categorie) => (this.donnees[categorie][type][statut]))
      .reduce((acc, total) => (acc + total), 0);

    const resultat = [...Mesure.statutsPossibles(), 'total']
      .reduce((acc, statut) => Object.assign(acc, { [statut]: totalToutesCategories(statut) }), {});

    resultat.restant = resultat.total - resultat.fait;
    return resultat;
  }

  indiceCyber() {
    const nbMesures = (categorie) => {
      const { indispensables, recommandees } = this.donnees[categorie];
      return indispensables.total + recommandees.total;
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

  retenues(idCategorie) {
    return this.donnees[idCategorie].retenues;
  }

  score(idCategorie) {
    const {
      indispensables,
      recommandees,
    } = this.donnees[idCategorie];

    const indispensablesFaites = indispensables.fait;
    const totalIndispensables = indispensables.total;
    const recommandeesFaites = recommandees.fait;
    const totalRecommandees = recommandees.total;

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
}

module.exports = StatistiquesMesures;
