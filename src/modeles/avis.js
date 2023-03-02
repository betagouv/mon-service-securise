const InformationsHomologation = require('./informationsHomologation');
const { ErreurDureeValiditeInvalide, ErreurAvisInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');

class Avis extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: ['prenomNom', 'statut', 'dureeValidite'],
      proprietesAtomiquesFacultatives: ['commentaires'],
    });

    Avis.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);
  }

  static valide({ dureeValidite, statut }, referentiel) {
    if (!referentiel.estIdentifiantEcheanceRenouvellementConnu(dureeValidite)) {
      throw new ErreurDureeValiditeInvalide(`La durée de validité "${dureeValidite}" est invalide`);
    }
    if (!referentiel.estIdentifiantStatutAvisDossierHomologationConnu(statut)) {
      throw new ErreurAvisInvalide(`L'avis "${statut}" est invalide`);
    }
  }
}

module.exports = Avis;
