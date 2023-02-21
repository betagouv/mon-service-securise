const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const Autorite = require('./etapes/autorite');
const Decision = require('./etapes/decision');
const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');

class Dossier extends InformationsHomologation {
  constructor(
    donneesDossier = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    donneesDossier.finalise = !!donneesDossier.finalise;

    super({ proprietesAtomiquesFacultatives: ['id', 'finalise'] });
    this.renseigneProprietes(donneesDossier);

    const donneesDecision = donneesDossier.decision || {
      dateHomologation: donneesDossier.dateHomologation,
      dureeValidite: donneesDossier.dureeValidite,
    };
    this.decision = new Decision(
      donneesDecision,
      referentiel,
      adaptateurHorloge
    );
    this.autorite = new Autorite(donneesDossier.autorite);
  }

  descriptionDateHomologation() {
    return this.decision.descriptionDateHomologation();
  }

  descriptionDureeValidite() {
    return this.decision.descriptionDureeValidite();
  }

  dateProchaineHomologation() {
    return this.decision.dateProchaineHomologation();
  }

  descriptionProchaineDateHomologation() {
    return this.decision.descriptionProchaineDateHomologation();
  }

  estComplet() {
    return this.decision.estComplete();
  }

  estActif() {
    if (!this.estComplet()) return false;
    return this.decision.periodeHomologationEstEnCours();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      decision: this.decision.toJSON(),
      autorite: this.autorite.toJSON(),
    };
  }
}

module.exports = Dossier;
