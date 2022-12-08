const InformationsHomologation = require('./informationsHomologation');
const { ErreurDateHomologationInvalide, ErreurDureeValiditeInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');

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

    if (dateHomologation && Number.isNaN(new Date(dateHomologation).valueOf())) {
      throw new ErreurDateHomologationInvalide(
        `La date "${dateHomologation}" est invalide`
      );
    }
  }
}

module.exports = Dossier;
