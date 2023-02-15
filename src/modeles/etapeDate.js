const { ErreurDateHomologationInvalide, ErreurDureeValiditeInvalide } = require('../erreurs');
const Etape = require('./etape');
const { ajouteMoisADate, dateEnFrancais, dateInvalide } = require('../utilitaires/date');
const Referentiel = require('../referentiel');

class EtapeDate extends Etape {
  constructor(
    { dateHomologation, dureeValidite } = {},
    referentiel = Referentiel.creeReferentielVide()
  ) {
    super({ proprietesAtomiquesFacultatives: ['dateHomologation', 'dureeValidite'] }, referentiel);
    EtapeDate.valide({ dateHomologation, dureeValidite }, referentiel);
    this.renseigneProprietes({ dateHomologation, dureeValidite });
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

  estComplete() {
    return !!this.dateHomologation && !!this.dureeValidite;
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

module.exports = EtapeDate;
