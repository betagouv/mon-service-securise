const InformationsService = require('./informationsService');
const NiveauGravite = require('./niveauGravite');
const Referentiel = require('../referentiel');
const { ErreurNiveauVraisemblanceInconnu } = require('../erreurs');

const NiveauRisque = { NIVEAU_RISQUE_INDETERMINABLE: 'indeterminable' };

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
    this.referentiel = referentiel;
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

  niveauRisque() {
    if (!this.niveauVraisemblance || !this.niveauGravite) {
      return NiveauRisque.NIVEAU_RISQUE_INDETERMINABLE;
    }
    return this.referentiel.niveauRisque(
      this.niveauVraisemblance,
      this.niveauGravite
    );
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

Object.assign(Risque, NiveauRisque);
module.exports = Risque;
