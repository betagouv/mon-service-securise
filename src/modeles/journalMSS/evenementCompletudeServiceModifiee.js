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
      if (!donnees.idService) throw new ErreurIdentifiantServiceManquant();
      if (!donnees.nombreTotalMesures) throw new ErreurNombreTotalMesuresManquant();
      if (!donnees.nombreMesuresCompletes) throw new ErreurNombreMesuresCompletesManquant();
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
