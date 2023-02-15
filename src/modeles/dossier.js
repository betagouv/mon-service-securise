const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const EtapeDate = require('./etapeDate');
const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');

class Dossier extends InformationsHomologation {
  constructor(
    donneesDossier = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    donneesDossier.finalise = !!donneesDossier.finalise;

    super({ proprietesAtomiquesFacultatives: ['id', 'dateHomologation', 'dureeValidite', 'finalise'] });
    this.renseigneProprietes(donneesDossier);

    this.etapeDate = new EtapeDate(
      { dateHomologation: this.dateHomologation, dureeValidite: this.dureeValidite },
      referentiel
    );

    this.adaptateurHorloge = adaptateurHorloge;
  }

  descriptionDateHomologation() {
    return this.etapeDate.descriptionDateHomologation();
  }

  descriptionDureeValidite() {
    return this.etapeDate.descriptionDureeValidite();
  }

  dateProchaineHomologation() {
    return this.etapeDate.dateProchaineHomologation();
  }

  descriptionProchaineDateHomologation() {
    return this.etapeDate.descriptionProchaineDateHomologation();
  }

  estComplet() {
    return this.etapeDate.estComplete();
  }

  estActif() {
    const maintenant = this.adaptateurHorloge.maintenant();
    return new Date(this.dateHomologation) < maintenant
      && maintenant < this.dateProchaineHomologation();
  }
}

module.exports = Dossier;
