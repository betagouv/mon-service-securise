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

  toJSON() {
    const donnees = this.referentiel.actionSaisie(this.id);
    return {
      id: this.id,
      description: donnees.description,
      statut: this.service.statutSaisie(this.id),
      sousTitre: donnees.sousTitre,
      position: donnees.position,
      url: `/service/${this.service.id}/${this.id}`,
      rubriqueDroit: donnees.rubriqueDroit,
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
