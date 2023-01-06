const { ErreurIdentifiantServiceManquant } = require('./erreurs');
const Evenement = require('./evenement');

class EvenementServiceSupprime extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';
      if (manque(donnees.idService)) throw new ErreurIdentifiantServiceManquant();
    };

    valide();

    super(
      'SERVICE_SUPPRIME',
      { idService: adaptateurChiffrement.hacheSha256(donnees.idService) },
      date
    );
  }
}

module.exports = EvenementServiceSupprime;
