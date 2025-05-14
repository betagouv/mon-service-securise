const ElementsConstructibles = require('../elementsConstructibles');
const ServiceTeleverse = require('./serviceTeleverse');

class TeleversementServices extends ElementsConstructibles {
  constructor(donnees) {
    const { services } = donnees;
    super(ServiceTeleverse, { items: services });
  }

  valide(nomServicesExistants = []) {
    const nomsAggreges = [...nomServicesExistants];
    return this.tous().map((s) => {
      const resultat = s.valide(nomsAggreges);
      nomsAggreges.push(s.nom);
      return resultat;
    });
  }
}

module.exports = TeleversementServices;
