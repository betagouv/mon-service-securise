const InformationsHomologation = require('./informationsHomologation');
const {
  ErreurDureeValiditeInvalide,
  ErreurAvisInvalide,
} = require('../erreurs');
const Referentiel = require('../referentiel');

class Avis extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: Avis.proprietesAtomiquesRequises(),
      proprietesAtomiquesFacultatives: Avis.proprietesAtomiquesFacultatives(),
      proprietesListes: Avis.proprietesListes(),
    });

    Avis.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);
  }

  static proprietesAtomiquesRequises() {
    return ['statut', 'dureeValidite'];
  }

  static proprietesAtomiquesFacultatives() {
    return ['commentaires'];
  }

  static proprietesListes() {
    return ['collaborateurs'];
  }

  static valide({ dureeValidite, statut }, referentiel) {
    if (!referentiel.estIdentifiantEcheanceRenouvellementConnu(dureeValidite)) {
      throw new ErreurDureeValiditeInvalide(
        `La durée de validité "${dureeValidite}" est invalide`
      );
    }
    if (!referentiel.estIdentifiantStatutAvisDossierHomologationConnu(statut)) {
      throw new ErreurAvisInvalide(`L'avis "${statut}" est invalide`);
    }
  }

  statutSaisie() {
    const statutSaisieProprietesAtomiques = super.statutSaisie();
    const collaborateursSaisis =
      this.collaborateurs.length > 0 && this.collaborateurs.every((c) => !!c);
    switch (statutSaisieProprietesAtomiques) {
      case InformationsHomologation.COMPLETES:
        return collaborateursSaisis
          ? InformationsHomologation.COMPLETES
          : InformationsHomologation.A_COMPLETER;
      case InformationsHomologation.A_SAISIR:
        return collaborateursSaisis
          ? InformationsHomologation.A_COMPLETER
          : InformationsHomologation.A_SAISIR;
      default:
        return InformationsHomologation.A_COMPLETER;
    }
  }
}

module.exports = Avis;
