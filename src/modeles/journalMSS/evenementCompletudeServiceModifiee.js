const Evenement = require('./evenement');
const { ErreurServiceManquant } = require('./erreurs');

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.service)) throw new ErreurServiceManquant();
    };

    const enTableau = (donneesIndiceCyber) =>
      Object.entries(donneesIndiceCyber).reduce(
        (acc, [categorie, indice]) => [...acc, { categorie, indice }],
        []
      );

    valide();

    const { service } = donnees;
    const { indiceCyber, ...autreDonneesCompletude } =
      service.completudeMesures();
    const { borneBasse, borneHaute } =
      service.descriptionService.nombreOrganisationsUtilisatrices;

    const nombreOuUn = (nombre) => Number(nombre) || 1;

    super(
      'COMPLETUDE_SERVICE_MODIFIEE',
      {
        idService: adaptateurChiffrement.hacheSha256(service.id),
        detailIndiceCyber: enTableau(indiceCyber),
        ...autreDonneesCompletude,
        nombreOrganisationsUtilisatrices: {
          borneBasse: nombreOuUn(borneBasse),
          borneHaute: nombreOuUn(borneHaute),
        },
      },
      date
    );
  }
}

module.exports = EvenementCompletudeServiceModifiee;
