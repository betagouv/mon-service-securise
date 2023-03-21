const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const Autorite = require('./etapes/autorite');
const DatesTelechargements = require('./etapes/datesTelechargements');
const Decision = require('./etapes/decision');
const EtapeAvis = require('./etapes/etapeAvis');
const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');
const { ErreurDossierDejaFinalise } = require('../erreurs');

class Dossier extends InformationsHomologation {
  constructor(
    donneesDossier = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    donneesDossier.finalise = !!donneesDossier.finalise;

    super({
      proprietesAtomiquesFacultatives: ['id', 'finalise'],
    });
    this.renseigneProprietes(donneesDossier, referentiel);

    this.decision = new Decision(
      donneesDossier.decision,
      referentiel,
      adaptateurHorloge
    );
    this.autorite = new Autorite(donneesDossier.autorite);
    this.datesTelechargements = new DatesTelechargements(
      donneesDossier.datesTelechargements ?? {},
      referentiel
    );
    this.avis = new EtapeAvis({ avis: donneesDossier.avis }, referentiel);
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

  enregistreAutoriteHomologation(nom, fonction) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.autorite.enregistreAutoriteHomologation(nom, fonction);
  }

  enregistreAvis(avis) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.avis.enregistreAvis(avis);
  }

  enregistreDateTelechargement(nomDocument, date) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.datesTelechargements.enregistreDateTelechargement(nomDocument, date);
  }

  enregistreDecision(dateHomologation, dureeHomologation) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.decision.enregistre(dateHomologation, dureeHomologation);
  }

  estComplet() {
    return this.decision.estComplete()
      && this.datesTelechargements.estComplete()
      && this.autorite.estComplete();
  }

  estActif() {
    return this.finalise && this.decision.periodeHomologationEstEnCours();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      decision: this.decision.toJSON(),
      autorite: this.autorite.toJSON(),
      datesTelechargements: this.datesTelechargements.toJSON(),
      ...this.avis.toJSON(),
    };
  }
}

module.exports = Dossier;
