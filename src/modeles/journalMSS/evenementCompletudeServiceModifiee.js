const Evenement = require('./evenement');
const {
  ErreurDetailMesuresManquant,
  ErreurIdentifiantServiceManquant,
  ErreurNombreMesuresCompletesManquant,
  ErreurNombreOrganisationsUtilisatricesManquant,
  ErreurNombreTotalMesuresManquant,
  ErreurIndiceCyberManquant,
  ErreurServiceManquant,
} = require('./erreurs');

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.service)) throw new ErreurServiceManquant();
      if (manque(donnees.idService))
        throw new ErreurIdentifiantServiceManquant();
      if (manque(donnees.nombreTotalMesures))
        throw new ErreurNombreTotalMesuresManquant();
      if (manque(donnees.nombreMesuresCompletes))
        throw new ErreurNombreMesuresCompletesManquant();
      if (manque(donnees.detailMesures))
        throw new ErreurDetailMesuresManquant();
      if (manque(donnees.indiceCyber)) throw new ErreurIndiceCyberManquant();
      if (manque(donnees.nombreOrganisationsUtilisatrices))
        throw new ErreurNombreOrganisationsUtilisatricesManquant();
    };

    const enTableau = (donneesIndiceCyber) =>
      Object.entries(donneesIndiceCyber).reduce(
        (acc, [categorie, indice]) => [...acc, { categorie, indice }],
        []
      );

    valide();

    const { idService, indiceCyber, service, ...donneesBrutes } = donnees;

    super(
      'COMPLETUDE_SERVICE_MODIFIEE',
      {
        idService: adaptateurChiffrement.hacheSha256(idService),
        detailIndiceCyber: enTableau(indiceCyber),
        ...donneesBrutes,
        nombreOrganisationsUtilisatrices: {
          borneBasse:
            Number(donnees.nombreOrganisationsUtilisatrices.borneBasse) || 1,
          borneHaute:
            Number(donnees.nombreOrganisationsUtilisatrices.borneHaute) || 1,
        },
      },
      date
    );
  }
}

module.exports = EvenementCompletudeServiceModifiee;
