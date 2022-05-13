const Referentiel = require('./referentiel');
const Profil = require('./modeles/profils/profil');

class MoteurRegles {
  constructor(referentiel = Referentiel.creeReferentielVide()) {
    this.reglesPersonnalisation = referentiel.reglesPersonnalisation();
    this.referentiel = referentiel;
  }

  mesuresAModifier(descriptionService, mesuresACibler) {
    const { clefsDescriptionServiceAConsiderer = [] } = this.reglesPersonnalisation;
    const valeursDescriptionService = clefsDescriptionServiceAConsiderer.flatMap(
      (clef) => descriptionService[clef]
    );

    const profils = this.reglesPersonnalisation.profils || {};
    const mapMesures = Object.keys(profils).map((profil) => new Profil(
      profils[profil].regles,
      {
        ajouter: profils[profil].mesuresAAjouter,
        retirer: profils[profil].mesuresARetirer,
      }
    )).flatMap((profil) => profil[mesuresACibler](valeursDescriptionService))
      .reduce((accumulateur, mesure) => ({ ...accumulateur, [mesure]: mesure }), {});

    return Object.keys(mapMesures);
  }

  mesuresAAjouter(descriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresAAjouter');
  }

  mesuresARetirer(descriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresARetirer');
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
