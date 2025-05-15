const ElementsConstructibles = require('../elementsConstructibles');
const ServiceTeleverse = require('./serviceTeleverse');
const Referentiel = require('../../referentiel');

const STATUT = {
  INVALIDE: 'INVALIDE',
  VALIDE: 'VALIDE',
};

class TeleversementServices extends ElementsConstructibles {
  constructor(donnees, referentiel = Referentiel.creeReferentielVide()) {
    const { services } = donnees;
    super(ServiceTeleverse, { items: services }, referentiel);
  }

  valide(nomServicesExistants = []) {
    const nomsAggreges = [...nomServicesExistants];
    return this.tous().map((s) => {
      const resultat = s.valide(nomsAggreges);
      nomsAggreges.push(s.nom);
      return resultat;
    });
  }

  rapportDetaille(nomServicesExistants = []) {
    const erreurs = this.valide(nomServicesExistants);
    const statut = erreurs.some((e) => e.length)
      ? STATUT.INVALIDE
      : STATUT.VALIDE;
    return {
      statut,
      services: this.tous().map((s, index) => ({
        service: s.toJSON(),
        erreurs: erreurs[index],
      })),
    };
  }
}

module.exports = TeleversementServices;
