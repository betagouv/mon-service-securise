const Mesure = require('./mesure');
const {
  ErreurCategorieInconnue,
  ErreurDetachementModeleMesureSpecifiqueImpossible,
} = require('../erreurs');
const Referentiel = require('../referentiel');

class MesureSpecifique extends Mesure {
  constructor(
    donneesMesure = {},
    referentiel = Referentiel.creeReferentielVide()
  ) {
    super({
      proprietesAtomiquesRequises: MesureSpecifique.proprietesObligatoires(),
      proprietesAtomiquesFacultatives: [
        'modalites',
        'priorite',
        'echeance',
        'descriptionLongue',
        'idModele',
      ],
      proprietesListes: ['responsables'],
    });

    MesureSpecifique.valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure);

    this.referentiel = referentiel;
    this.echeance = donneesMesure.echeance && new Date(donneesMesure.echeance);
  }

  descriptionMesure() {
    return this.description;
  }

  statutRenseigne() {
    return Mesure.statutRenseigne(this.statut);
  }

  donneesSerialisees() {
    const toutesDonnees = super.donneesSerialisees();

    const lieeAUnModele = toutesDonnees.idModele;
    if (lieeAUnModele) {
      delete toutesDonnees.description;
      delete toutesDonnees.descriptionLongue;
      delete toutesDonnees.categorie;
    }

    return {
      ...toutesDonnees,
      ...(this.echeance && { echeance: new Date(this.echeance).toISOString() }),
    };
  }

  supprimeResponsable(idUtilisateur) {
    this.responsables = this.responsables.filter((r) => r !== idUtilisateur);
  }

  detacheDeSonModele() {
    if (!this.idModele)
      throw new ErreurDetachementModeleMesureSpecifiqueImpossible(
        `Impossible de détacher la mesure '${this.id}' : elle n'est pas reliée à un modèle.`
      );

    delete this.idModele;
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
