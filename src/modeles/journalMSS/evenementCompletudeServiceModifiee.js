const Evenement = require('./evenement');
const {
  ErreurDetailMesuresManquant,
  ErreurIdentifiantServiceManquant,
  ErreurNombreMesuresCompletesManquant,
  ErreurNombreTotalMesuresManquant,
  ErreurIndiceCyberManquant,
} = require('./erreurs');

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.idService))
        throw new ErreurIdentifiantServiceManquant();
      if (manque(donnees.nombreTotalMesures))
        throw new ErreurNombreTotalMesuresManquant();
      if (manque(donnees.nombreMesuresCompletes))
        throw new ErreurNombreMesuresCompletesManquant();
      if (manque(donnees.detailMesures))
        throw new ErreurDetailMesuresManquant();
      if (manque(donnees.indiceCyber)) throw new ErreurIndiceCyberManquant();
    };

    const enTableau = (donneesIndiceCyber) =>
      Object.entries(donneesIndiceCyber).reduce(
        (acc, [categorie, indice]) => [...acc, { categorie, indice }],
        []
      );

    valide();

    const { idService, indiceCyber, ...donneesBrutes } = donnees;

    super(
      'COMPLETUDE_SERVICE_MODIFIEE',
      {
        idService: adaptateurChiffrement.hacheSha256(idService),
        detailIndiceCyber: enTableau(indiceCyber),
        ...donneesBrutes,
      },
      date
    );
  }
}

module.exports = EvenementCompletudeServiceModifiee;
