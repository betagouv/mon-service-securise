const Base = require('./base');
const InformationsHomologation = require('./informationsHomologation');
const Homologation = require('./homologation');

const {
  ErreurIdentifiantActionSaisieInvalide,
  ErreurIdentifiantActionSaisieManquant,
  ErreurVersionActionSaisieManquante,
} = require('../erreurs');
const Referentiel = require('../referentiel');

class ActionSaisie extends Base {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    homologation = new Homologation({})
  ) {
    super({ proprietesAtomiquesRequises: ['id', 'version'] });
    ActionSaisie.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);

    this.homologation = homologation;
    this.referentiel = referentiel;
  }

  description() {
    return this.referentiel.descriptionActionSaisie(this.version, this.id);
  }

  indisponible() {
    return this.referentiel.actionSaisieIndisponible(this.version, this.id);
  }

  sousTitre() {
    return this.referentiel.sousTitreActionSaisie(this.version, this.id);
  }

  statut() {
    return this.indisponible()
      ? InformationsHomologation.A_SAISIR
      : this.homologation.statutSaisie(this.id);
  }

  suivante() {
    return this.referentiel.actionSuivante(this.version, this.id);
  }

  toJSON() {
    const resultat = {
      id: this.id,
      description: this.description(),
      statut: this.statut(),
    };

    if (this.version === 'v2') {
      resultat.sousTitre = this.sousTitre();
      resultat.indisponible = this.indisponible();
    }

    return resultat;
  }

  static valide(donnees, referentiel) {
    const { id, version } = donnees;
    if (!id) {
      throw new ErreurIdentifiantActionSaisieManquant(
        "L'identifiant d'action de saisie doit être renseigné"
      );
    }

    if (!version) {
      throw new ErreurVersionActionSaisieManquante(
        "La version d'action de saisie doit être renseignée"
      );
    }

    const identifiants = referentiel.identifiantsActionsSaisie(version);
    if (!identifiants.includes(id)) {
      throw new ErreurIdentifiantActionSaisieInvalide(
        `L'action de saisie "${id}" est invalide`
      );
    }
  }
}

module.exports = ActionSaisie;
