import Service from '../service.js';
import DescriptionService from '../descriptionService.js';
import FonctionnalitesSpecifiques from '../fonctionnalitesSpecifiques.js';
import DonneesSensiblesSpecifiques from '../donneesSensiblesSpecifiques.js';

type BornesOrganisations = { borneBasse: number; borneHaute: number };

const nombreOuUn = (nombre: number) => Number(nombre) || 1;

export const completudeV1 = (service: Service) => {
  const {
    typeService,
    nombreOrganisationsUtilisatrices,
    provenanceService,
    statutDeploiement,
    fonctionnalites,
    fonctionnalitesSpecifiques,
    donneesCaracterePersonnel,
    donneesSensiblesSpecifiques,
    localisationDonnees,
    delaiAvantImpactCritique,
  } = service.descriptionService as DescriptionService;
  const { borneBasse, borneHaute } =
    nombreOrganisationsUtilisatrices as BornesOrganisations;

  return {
    nombreOrganisationsUtilisatrices: {
      borneBasse: nombreOuUn(borneBasse),
      borneHaute: nombreOuUn(borneHaute),
    },
    typeService,
    provenanceService,
    statutDeploiement,
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
  };
};
