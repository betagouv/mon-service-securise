const { ErreurServiceManquant } = require('./erreurs');
const Evenement = require('./evenement');

class EvenementRisquesServiceModifies extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);
    const { service } = donnees;

    if (!service) throw new ErreurServiceManquant();

    super(
      'RISQUES_SERVICE_MODIFIES',
      {
        idService: adaptateurChiffrement.hacheSha256(service.id),
        risquesGeneraux: service.risquesGeneraux().donneesSerialisees(),
        risquesSpecifiques: service.risquesSpecifiques().donneesSerialisees(),
      },
      date
    );
  }
}

module.exports = EvenementRisquesServiceModifies;
