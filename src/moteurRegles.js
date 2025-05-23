const Referentiel = require('./referentiel');
const Profil = require('./modeles/profils/profil');
const adaptateurEnvironnement = require('./adaptateurs/adaptateurEnvironnement');

class MoteurRegles {
  constructor(
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurEnv = adaptateurEnvironnement
  ) {
    this.reglesPersonnalisation = referentiel.reglesPersonnalisation();
    this.referentiel = referentiel;
    this.adaptateurEnvironnement = adaptateurEnv;
  }

  mesuresAModifier(descriptionService, mesuresACibler) {
    const { clefsDescriptionServiceAConsiderer = [], profils = {} } =
      this.reglesPersonnalisation;

    const valeursDescriptionService = clefsDescriptionServiceAConsiderer
      .filter((clef) => descriptionService[clef] !== false)
      .flatMap((clef) => descriptionService[clef]);

    const mapMesures = Object.keys(profils)
      .map(
        (profil) =>
          new Profil(profils[profil].regles, {
            ajouter: profils[profil].mesuresAAjouter,
            retirer: profils[profil].mesuresARetirer,
            rendreIndispensables: profils[profil].mesuresARendreIndispensables,
          })
      )
      .flatMap((profil) => profil[mesuresACibler](valeursDescriptionService));
    return [...new Set(mapMesures)];
  }

  mesuresAAjouter(descriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresAAjouter');
  }

  mesuresARendreIndispensables(descriptionService) {
    return this.mesuresAModifier(
      descriptionService,
      'mesuresARendreIndispensables'
    );
  }

  mesuresARetirer(descriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresARetirer');
  }

  mesures(...params) {
    const { mesuresBase = [] } = this.reglesPersonnalisation;
    const mesuresAAjouter = this.mesuresAAjouter(...params);
    const mesuresARetirer = this.mesuresARetirer(...params);
    const mesuresARendreIndispensables = this.mesuresARendreIndispensables(
      ...params
    );

    const idsMesures = mesuresBase
      .concat(mesuresAAjouter)
      .filter((mesure) => !mesuresARetirer.includes(mesure));

    const litMesuresEtRendIndispensable = () => {
      const idsARendreIndispensables = new Set(mesuresARendreIndispensables);
      const resultat = new Map();

      idsMesures.forEach((idMesure) => {
        const mesure = this.referentiel.mesure(idMesure);
        mesure.indispensable ||= idsARendreIndispensables.has(idMesure);
        resultat.set(idMesure, mesure);
      });
      return Object.fromEntries(resultat.entries());
    };
    return litMesuresEtRendIndispensable();
  }
}

module.exports = MoteurRegles;
