const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const EtapeDate = require('./etapes/etapeDate');
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

    this.etapeDate = new EtapeDate(
      {
        dateHomologation: donneesDossier.dateHomologation,
        dureeValidite: donneesDossier.dureeValidite,
      },
      referentiel,
      adaptateurHorloge
    );
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
    if (!this.estComplet()) return false;
    return this.etapeDate.periodeHomologationEstEnCours();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...this.etapeDate.toJSON(),
    };
  }
}

module.exports = Dossier;
