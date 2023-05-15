const Mesure = require('./mesure');
const { ErreurCategorieInconnue } = require('../erreurs');
const Referentiel = require('../referentiel');

class MesureSpecifique extends Mesure {
  constructor(
    donneesMesure = {},
    referentiel = Referentiel.creeReferentielVide()
  ) {
    super({
      proprietesAtomiquesRequises: MesureSpecifique.proprietesObligatoires(),
      proprietesAtomiquesFacultatives: ['modalites'],
    });

    MesureSpecifique.valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure);

    this.referentiel = referentiel;
  }

  descriptionMesure() {
    return this.description;
  }

  statutRenseigne() {
    return Mesure.statutRenseigne(this.statut);
  }

  static proprietesObligatoires() {
    return ['description', 'categorie', 'statut'];
  }

  static valide({ categorie, statut }, referentiel) {
    super.valide({ statut });

    const identifiantsCategoriesMesures =
      referentiel.identifiantsCategoriesMesures();
    if (categorie && !identifiantsCategoriesMesures.includes(categorie)) {
      throw new ErreurCategorieInconnue(
        `La catégorie "${categorie}" n'est pas répertoriée`
      );
    }
  }
}

module.exports = MesureSpecifique;
