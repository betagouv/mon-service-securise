const Base = require('./base');
const Service = require('./service');

const {
  ErreurIdentifiantActionSaisieInvalide,
  ErreurIdentifiantActionSaisieManquant,
} = require('../erreurs');
const Referentiel = require('../referentiel');

class ActionSaisie extends Base {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    service = new Service({})
  ) {
    super({ proprietesAtomiquesRequises: ['id'] });
    ActionSaisie.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);

    this.service = service;
    this.referentiel = referentiel;
  }

  description() {
    return this.referentiel.descriptionActionSaisie(this.id);
  }

  sousTitre() {
    return this.referentiel.sousTitreActionSaisie(this.id);
  }

  statut() {
    return this.service.statutSaisie(this.id);
  }

  suivante() {
    return this.referentiel.actionSuivante(this.id);
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description(),
      statut: this.statut(),
      sousTitre: this.sousTitre(),
      url: `/service/${this.service.id}/${this.id}`,
    };
  }

  static valide(donnees, referentiel) {
    const { id } = donnees;
    if (!id) {
      throw new ErreurIdentifiantActionSaisieManquant(
        "L'identifiant d'action de saisie doit être renseigné"
      );
    }

    const identifiants = referentiel.identifiantsActionsSaisie();
    if (!identifiants.includes(id)) {
      throw new ErreurIdentifiantActionSaisieInvalide(
        `L'action de saisie "${id}" est invalide`
      );
    }
  }
}

module.exports = ActionSaisie;
