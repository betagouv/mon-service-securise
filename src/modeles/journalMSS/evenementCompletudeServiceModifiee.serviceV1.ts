import Service from '../service.js';
import DescriptionService from '../descriptionService.js';
import PointsAcces from '../pointsAcces.js';
import FonctionnalitesSpecifiques from '../fonctionnalitesSpecifiques.js';
import DonneesSensiblesSpecifiques from '../donneesSensiblesSpecifiques.js';

type BornesOrganisations = { borneBasse: number; borneHaute: number };

const nombreOuUn = (nombre: number) => Number(nombre) || 1;

export const completudeV1 = (service: Service) => {
  const { nombreTotalMesures, nombreMesuresCompletes, detailMesures } =
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

  return {
    versionIndiceCyber: 'v2',
    nombreTotalMesures,
    nombreMesuresCompletes,
    detailMesures,
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
  };
};
