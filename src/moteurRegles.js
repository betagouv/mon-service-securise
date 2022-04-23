const Referentiel = require('./referentiel');

class MoteurRegles {
  constructor(referentiel = Referentiel.creeReferentielVide()) {
    this.reglesPersonnalisation = referentiel.reglesPersonnalisation();
    this.referentiel = referentiel;
  }

  mesuresAAjouter(descriptionService) {
    const {
      clefsDescriptionServiceAConsiderer = [],
      mesuresAAjouter = {},
    } = this.reglesPersonnalisation;

    const valeursDescriptionService = clefsDescriptionServiceAConsiderer.flatMap(
      (clef) => descriptionService[clef]
    );

    return Object.keys(mesuresAAjouter)
      .filter((clef) => valeursDescriptionService.includes(clef))
      .flatMap((clef) => mesuresAAjouter[clef]);
  }

  mesures(...params) {
    const { mesuresBase = [] } = this.reglesPersonnalisation;
    const mesuresAAjouter = this.mesuresAAjouter(...params);
    const idMesures = mesuresBase.concat(mesuresAAjouter);

    return idMesures.reduce(
      (resultat, id) => Object.assign(resultat, { [id]: this.referentiel.mesure(id) }),
      {},
    );
  }
}

module.exports = MoteurRegles;
