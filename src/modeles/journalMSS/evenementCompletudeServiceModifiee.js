import Evenement from './evenement.js';
import DescriptionService from '../descriptionService.js';

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, ['service']);

    const enTableau = (donneesIndiceCyber) =>
      Object.entries(donneesIndiceCyber).reduce(
        (acc, [categorie, indice]) => [...acc, { categorie, indice }],
        []
      );

    const { service } = donnees;
    const niveauSecuriteMinimal = DescriptionService.estimeNiveauDeSecurite(
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
        niveauSecurite,
        niveauSecuriteMinimal,
      },
      date
    );
  }
}

export default EvenementCompletudeServiceModifiee;
