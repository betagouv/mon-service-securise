const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
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

    this.decision = new Decision(
      {
        dateHomologation: donneesDossier.dateHomologation,
        dureeValidite: donneesDossier.dureeValidite,
      },
      referentiel,
      adaptateurHorloge
    );
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
      ...this.decision.toJSON(),
    };
  }
}

module.exports = Dossier;
