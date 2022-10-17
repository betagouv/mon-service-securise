const Referentiel = require('./referentiel');
const Profil = require('./modeles/profils/profil');

class MoteurRegles {
  constructor(referentiel = Referentiel.creeReferentielVide()) {
    this.reglesPersonnalisation = referentiel.reglesPersonnalisation();
    this.referentiel = referentiel;
  }

  mesuresAModifier(descriptionService, mesuresACibler) {
    const { clefsDescriptionServiceAConsiderer = [], profils = {} } = this.reglesPersonnalisation;

    const valeursDescriptionService = clefsDescriptionServiceAConsiderer.flatMap(
      (clef) => descriptionService[clef]
    );

    const mapMesures = Object.keys(profils).map((profil) => new Profil(
      profils[profil].regles,
      {
        ajouter: profils[profil].mesuresAAjouter,
        retirer: profils[profil].mesuresARetirer,
        rendreIndispensables: profils[profil].mesuresARendreIndispensables,
      }
    )).flatMap((profil) => profil[mesuresACibler](valeursDescriptionService))
      .reduce((accumulateur, mesure) => ({ ...accumulateur, [mesure]: mesure }), {});

    return Object.keys(mapMesures);
  }

  mesuresAAjouter(descriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresAAjouter');
  }

  mesuresARendreIndispensables(descriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresARendreIndispensables');
  }

  mesuresARetirer(descriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresARetirer');
  }

  mesures(...params) {
    const { mesuresBase = [] } = this.reglesPersonnalisation;
    const mesuresAAjouter = this.mesuresAAjouter(...params);
    const mesuresARetirer = this.mesuresARetirer(...params);
    const mesuresARendreIndispensables = this.mesuresARendreIndispensables(...params);

    const idsMesures = mesuresBase
      .concat(mesuresAAjouter)
      .filter((mesure) => !mesuresARetirer.includes(mesure));

    const mesureAvecImportanceAjustee = (idsMesuresReference, idMesure) => {
      const mesure = this.referentiel.mesure(idMesure);
      mesure.indispensable ||= idsMesuresReference.includes(idMesure);

      return mesure;
    };

    const ajouteEtRendsIndispensable = (idsMesuresReference, accumulateur, idMesure) => (
      Object.assign(accumulateur, {
        [idMesure]: mesureAvecImportanceAjustee(idsMesuresReference, idMesure),
      })
    );

    return idsMesures.reduce((...parametres) => (
      ajouteEtRendsIndispensable(mesuresARendreIndispensables, ...parametres)
    ), {});
  }
}

module.exports = MoteurRegles;
