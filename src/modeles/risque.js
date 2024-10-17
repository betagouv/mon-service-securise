const InformationsService = require('./informationsService');
const NiveauGravite = require('./niveauGravite');
const Referentiel = require('../referentiel');
const { ErreurNiveauVraisemblanceInconnu } = require('../erreurs');

class Risque extends InformationsService {
  constructor(
    donneesRisque = {},
    referentiel = Referentiel.creeReferentielVide()
  ) {
    super({
      proprietesAtomiquesRequises: [
        'id',
        'niveauGravite',
        'niveauVraisemblance',
      ],
      proprietesAtomiquesFacultatives: ['commentaire'],
    });

    this.renseigneProprietes(donneesRisque);
    this.objetNiveauGravite = new NiveauGravite(
      this.niveauGravite,
      referentiel
    );
  }

  descriptionNiveauGravite() {
    return this.objetNiveauGravite.descriptionNiveau();
  }

  important() {
    return this.objetNiveauGravite.niveauImportant();
  }

  positionNiveauGravite() {
    return this.objetNiveauGravite.position;
  }

  static valide({ niveauVraisemblance }, referentiel) {
    const identifiantsNiveauxVraisemblance =
      referentiel.identifiantsNiveauxVraisemblance();
    if (
      niveauVraisemblance &&
      !identifiantsNiveauxVraisemblance.includes(niveauVraisemblance)
    ) {
      throw new ErreurNiveauVraisemblanceInconnu(
        `Le niveau de vraisemblance "${niveauVraisemblance}" n'est pas répertorié`
      );
    }
  }
}

module.exports = Risque;
