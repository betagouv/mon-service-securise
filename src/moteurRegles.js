const Referentiel = require('./referentiel');

class MoteurRegles {
  constructor(referentiel = Referentiel.creeReferentielVide()) {
    this.reglesPersonnalisation = referentiel.reglesPersonnalisation();
    this.referentiel = referentiel;
  }

  regle(identifiantRegle, descriptionService) {
    const { clefsDescriptionServiceAConsiderer = [] } = this.reglesPersonnalisation;
    const regle = this.reglesPersonnalisation[identifiantRegle] || {};

    const valeursDescriptionService = clefsDescriptionServiceAConsiderer.flatMap(
      (clef) => descriptionService[clef]
    );

    return Object.keys(regle)
      .filter((clef) => valeursDescriptionService.includes(clef))
      .flatMap((clef) => regle[clef]);
  }

  mesuresAAjouter(descriptionService) {
    return this.regle('mesuresAAjouter', descriptionService);
  }

  mesuresARetirer(descriptionService) {
    return this.regle('mesuresARetirer', descriptionService);
  }

  mesures(...params) {
    const { mesuresBase = [] } = this.reglesPersonnalisation;
    const mesuresAAjouter = this.mesuresAAjouter(...params);
    const mesuresARetirer = this.mesuresARetirer(...params);
    const idMesures = mesuresBase
      .concat(mesuresAAjouter)
      .filter((mesure) => !mesuresARetirer.includes(mesure));

    return idMesures.reduce(
      (resultat, id) => Object.assign(resultat, { [id]: this.referentiel.mesure(id) }),
      {},
    );
  }
}

module.exports = MoteurRegles;
