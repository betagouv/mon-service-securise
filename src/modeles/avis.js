const InformationsHomologation = require('./informationsHomologation');
const { ErreurDureeValiditeInvalide, ErreurAvisInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');

class Avis extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: Avis.proprietesAtomiquesRequises(),
      proprietesAtomiquesFacultatives: Avis.proprietesAtomiquesFacultatives(),
    });

    Avis.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);
  }

  static proprietesAtomiquesRequises() {
    return ['prenomNom', 'statut', 'dureeValidite'];
  }

  static proprietesAtomiquesFacultatives() {
    return ['commentaires'];
  }

  static proprietes() {
    return [...Avis.proprietesAtomiquesRequises(), ...Avis.proprietesAtomiquesFacultatives()];
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
