const InformationsHomologation = require('./informationsHomologation');
const { ErreurDateHomologationInvalide, ErreurDureeValiditeInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');
const { ajouteMoisADate, dateEnFrancais, dateInvalide } = require('../utilitaires/date');
const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');

class Dossier extends InformationsHomologation {
  constructor(
    donneesDossier = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    donneesDossier.finalise = !!donneesDossier.finalise;

    super({ proprietesAtomiquesFacultatives: ['id', 'dateHomologation', 'dureeValidite', 'finalise'] });
    Dossier.valide(donneesDossier, referentiel);
    this.renseigneProprietes(donneesDossier);

    this.referentiel = referentiel;
    this.adaptateurHorloge = adaptateurHorloge;
  }

  descriptionDateHomologation() {
    if (!this.dateHomologation) {
      return '';
    }

    return dateEnFrancais(this.dateHomologation);
  }

  descriptionDureeValidite() {
    if (!this.dureeValidite) {
      return '';
    }

    return this.referentiel.descriptionEcheanceRenouvellement(this.dureeValidite);
  }

  dateProchaineHomologation() {
    const date = new Date(this.dateHomologation);
    const nbMois = this.referentiel.nbMoisDecalage(this.dureeValidite);

    return ajouteMoisADate(nbMois, date);
  }

  descriptionProchaineDateHomologation() {
    if (!this.dateHomologation || !this.dureeValidite) {
      return '';
    }

    return dateEnFrancais(this.dateProchaineHomologation());
  }

  estComplet() {
    return !!this.dateHomologation && !!this.dureeValidite;
  }

  estActif() {
    const maintenant = this.adaptateurHorloge.maintenant();
    return new Date(this.dateHomologation) < maintenant
      && maintenant < this.dateProchaineHomologation();
  }

  static valide({ dateHomologation, dureeValidite }, referentiel) {
    const identifiantsDureesHomologation = referentiel.identifiantsEcheancesRenouvellement();
    if (dureeValidite && !identifiantsDureesHomologation.includes(dureeValidite)) {
      throw new ErreurDureeValiditeInvalide(
        `La durée de validité "${dureeValidite}" est invalide`
      );
    }

    if (dateHomologation && dateInvalide(dateHomologation)) {
      throw new ErreurDateHomologationInvalide(
        `La date "${dateHomologation}" est invalide`
      );
    }
  }
}

module.exports = Dossier;
