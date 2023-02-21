const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const EtapeDate = require('./etapeDate');
const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');
const { ErreurDossierDejaFinalise } = require('../erreurs');
const DatesTelechargements = require('./datesTelechargements');

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

    this.datesTelechargements = new DatesTelechargements(donneesDossier.datesTelechargements ?? {});
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

  enregistreDateTelechargement(nomDocument, date) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.datesTelechargements.enregistreDateTelechargement(nomDocument, date);
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
      datesTelechargements: this.datesTelechargements.toJSON(),
    };
  }
}

module.exports = Dossier;
