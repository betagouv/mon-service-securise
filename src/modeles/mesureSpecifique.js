const Mesure = require('./mesure');
const { ErreurCategorieInconnue } = require('../erreurs');
const Referentiel = require('../referentiel');

class MesureSpecifique extends Mesure {
  constructor(donneesMesure = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({ proprietesAtomiques: ['description', 'categorie', 'statut', 'modalites'] });

    MesureSpecifique.valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure);

    this.referentiel = referentiel;
  }

  descriptionMesure() {
    return this.description;
  }

  proprieteSaisie(nomPropriete) {
    return nomPropriete === 'modalites' ? true : super.proprieteSaisie(nomPropriete);
  }

  static valide({ categorie, statut }, referentiel) {
    super.valide({ statut });

    const identifiantsCategoriesMesures = referentiel.identifiantsCategoriesMesures();
    if (categorie && !identifiantsCategoriesMesures.includes(categorie)) {
      throw new ErreurCategorieInconnue(`La catégorie "${categorie}" n'est pas répertoriée`);
    }
  }
}

module.exports = MesureSpecifique;
