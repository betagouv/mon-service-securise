const Evenement = require('./evenement');
const {
  ErreurIdentifiantServiceManquant,
  ErreurNombreMesuresCompletesManquant,
  ErreurNombreTotalMesuresManquant,
} = require('./erreurs');

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.idService)) throw new ErreurIdentifiantServiceManquant();
      if (manque(donnees.nombreTotalMesures)) throw new ErreurNombreTotalMesuresManquant();
      if (manque(donnees.nombreMesuresCompletes)) throw new ErreurNombreMesuresCompletesManquant();
    };

    valide();

    super(
      'COMPLETUDE_SERVICE_MODIFIEE',
      { ...donnees, idService: adaptateurChiffrement.hacheSha256(donnees.idService) },
      date
    );
  }
}

module.exports = EvenementCompletudeServiceModifiee;
