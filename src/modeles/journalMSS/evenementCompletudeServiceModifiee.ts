const Evenement = require('./evenement');
const { ErreurServiceManquant } = require('./erreurs');
const { estimeNiveauDeSecurite } = require('../descriptionService');

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

    const { service, organisationResponsable } = donnees;
    const niveauSecuriteMinimal = estimeNiveauDeSecurite(
      service.descriptionService
    );
    const { indiceCyber, ...autreDonneesCompletude } =
      service.completudeMesures();
    const {
      typeService,
      nombreOrganisationsUtilisatrices,
      provenanceService,
      statutDeploiement,
      pointsAcces,
      fonctionnalites,
      fonctionnalitesSpecifiques,
      donneesCaracterePersonnel,
      donneesSensiblesSpecifiques,
      localisationDonnees,
      delaiAvantImpactCritique,
      niveauSecurite,
    } = service.descriptionService;
    const { borneBasse, borneHaute } = nombreOrganisationsUtilisatrices;

    const nombreOuUn = (nombre) => Number(nombre) || 1;

    super(
      'COMPLETUDE_SERVICE_MODIFIEE',
      {
        idService: adaptateurChiffrement.hacheSha256(service.id),
        detailIndiceCyber: enTableau(indiceCyber),
        versionIndiceCyber: 'v2',
        ...autreDonneesCompletude,
        nombreOrganisationsUtilisatrices: {
          borneBasse: nombreOuUn(borneBasse),
          borneHaute: nombreOuUn(borneHaute),
        },
        typeService,
        provenanceService,
        statutDeploiement,
        pointsAcces: pointsAcces.nombre(),
        fonctionnalites,
        fonctionnalitesSpecifiques: fonctionnalitesSpecifiques.nombre(),
        donneesCaracterePersonnel,
        donneesSensiblesSpecifiques: donneesSensiblesSpecifiques.nombre(),
        localisationDonnees,
        delaiAvantImpactCritique,
        organisationResponsable,
        niveauSecurite,
        niveauSecuriteMinimal,
      },
      date
    );
  }
}

module.exports = EvenementCompletudeServiceModifiee;
