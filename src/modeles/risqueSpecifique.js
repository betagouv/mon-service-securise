const Risque = require('./risque');
const {
  ErreurIntituleRisqueManquant,
  ErreurCategoriesRisqueManquantes,
  ErreurCategorieRisqueInconnue,
} = require('../erreurs');

class RisqueSpecifique extends Risque {
  constructor(donneesRisque, referentiel) {
    super(donneesRisque, referentiel);

    this.proprietesAtomiquesRequises.push('intitule');
    this.proprietesListes.push('categories');
    this.proprietesAtomiquesFacultatives.push('description');
    this.renseigneProprietes(donneesRisque);
  }

  categoriesRisque() {
    return this.categories;
  }

  intituleRisque() {
    return this.intitule;
  }

  static valide({ intitule, categories }, referentiel) {
    if (!intitule) {
      throw new ErreurIntituleRisqueManquant(
        "L'intitulé du risque est obligatoire."
      );
    }
    if (!categories || categories.length === 0) {
      throw new ErreurCategoriesRisqueManquantes(
        'Les catégories de risque sont obligatoires.'
      );
    }
    const categoriesInconnues = categories.filter(
      (c) => !referentiel.identifiantsCategoriesRisque().includes(c)
    );
    if (categoriesInconnues.length > 0) {
      throw new ErreurCategorieRisqueInconnue(
        `La catégorie "${categoriesInconnues[0]}" n'est pas répertoriée`
      );
    }
  }
}

module.exports = RisqueSpecifique;
