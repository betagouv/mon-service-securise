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
      proprietesAtomiquesFacultatives: ['modalites', 'priorite', 'echeance'],
      proprietesListes: ['responsables'],
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

  donneesSerialisees() {
    return {
      ...super.donneesSerialisees(),
      ...(this.echeance && { echeance: new Date(this.echeance).toISOString() }),
    };
  }

  supprimeResponsable(idUtilisateur) {
    this.responsables = this.responsables.filter((r) => r !== idUtilisateur);
  }

  static proprietesObligatoires() {
    return ['id', 'description', 'categorie', 'statut'];
  }

  static valide({ categorie, statut, priorite, echeance }, referentiel) {
    super.valide({ statut, priorite, echeance }, referentiel);

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
