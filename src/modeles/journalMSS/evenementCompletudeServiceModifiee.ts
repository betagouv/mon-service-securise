import Evenement from './evenement.js';
import Service from '../service.js';
import DescriptionService from '../descriptionService.js';
import PointsAcces from '../pointsAcces.js';
import FonctionnalitesSpecifiques from '../fonctionnalitesSpecifiques.js';
import DonneesSensiblesSpecifiques from '../donneesSensiblesSpecifiques.js';
import { CategorieMesure, DonneesIndiceCyber } from '../indiceCyber.type.js';

type TableauIndiceCyber = Array<{ categorie: CategorieMesure; indice: number }>;
type BornesOrganisations = { borneBasse: number; borneHaute: number };

const nombreOuUn = (nombre: number) => Number(nombre) || 1;

const enTableau = (donneesIndiceCyber: DonneesIndiceCyber) =>
  Object.entries(donneesIndiceCyber).reduce<TableauIndiceCyber>(
    (acc, [categorie, indice]) => [
      ...acc,
      { categorie: categorie as CategorieMesure, indice },
    ],
    []
  );

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees: { service: Service }, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, ['service']);

    const { service } = donnees;
    const niveauSecuriteMinimal = service.estimeNiveauDeSecurite();
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
    } = service.descriptionService as DescriptionService;
    const { borneBasse, borneHaute } =
      nombreOrganisationsUtilisatrices as BornesOrganisations;

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
        pointsAcces: (pointsAcces as PointsAcces).nombre(),
        fonctionnalites,
        fonctionnalitesSpecifiques: (
          fonctionnalitesSpecifiques as FonctionnalitesSpecifiques
        ).nombre(),
        donneesCaracterePersonnel,
        donneesSensiblesSpecifiques: (
          donneesSensiblesSpecifiques as DonneesSensiblesSpecifiques
        ).nombre(),
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
