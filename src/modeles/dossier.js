const InformationsHomologation = require('./informationsHomologation');
const { ErreurDateHomologationInvalide, ErreurDureeValiditeInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');
const { dateInvalide } = require('../utilitaires/date');

class Dossier extends InformationsHomologation {
  constructor(donneesDossier = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({ proprietesAtomiquesFacultatives: ['id', 'dateHomologation', 'dureeValidite'] });
    Dossier.valide(donneesDossier, referentiel);
    this.renseigneProprietes(donneesDossier);
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
