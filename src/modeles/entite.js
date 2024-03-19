const Base = require('./base');
const {
  ErreurDepartementInconnu,
  ErreurProprieteManquante,
} = require('../erreurs');
const Referentiel = require('../referentiel');

class Entite extends Base {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: ['nom', 'departement'],
    });
    this.renseigneProprietes(donnees);
  }

  static valideDonnees(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide()
  ) {
    const envoieErreurProprieteManquante = (propriete) => {
      throw new ErreurProprieteManquante(
        `La propriété "${propriete}" est requise`
      );
    };

    const valideDepartement = (codeDepartement) => {
      if (!referentiel.departement(codeDepartement)) {
        throw new ErreurDepartementInconnu(
          `Le département identifié par "${codeDepartement}" n'est pas répertorié`
        );
      }
    };

    if (typeof donnees.nom !== 'string' || donnees.nom === '') {
      envoieErreurProprieteManquante('entite.nom');
    }
    if (typeof donnees.departement !== 'string' || donnees.departement === '') {
      envoieErreurProprieteManquante('entite.departement');
    }
    valideDepartement(donnees.departement);
  }
}

module.exports = Entite;
