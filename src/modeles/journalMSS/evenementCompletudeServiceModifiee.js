const Evenement = require('./evenement');
const {
  ErreurDetailMesuresManquant,
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
      if (manque(donnees.detailMesures)) throw new ErreurDetailMesuresManquant();
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
