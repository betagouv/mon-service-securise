import Service from '../service.js';
import DescriptionService from '../descriptionService.js';
import FonctionnalitesSpecifiques from '../fonctionnalitesSpecifiques.js';
import DonneesSensiblesSpecifiques from '../donneesSensiblesSpecifiques.js';

type BornesOrganisations = { borneBasse: number; borneHaute: number };

const nombreOuUn = (nombre: number) => Number(nombre) || 1;

export const completudeV1 = (service: Service) => {
  const description = service.descriptionService as DescriptionService;

  const { borneBasse, borneHaute } =
    description.nombreOrganisationsUtilisatrices as BornesOrganisations;

  return {
    delaiAvantImpactCritique: description.delaiAvantImpactCritique,
    donneesCaracterePersonnel: description.donneesCaracterePersonnel,
    donneesSensiblesSpecifiques: (
      description.donneesSensiblesSpecifiques as DonneesSensiblesSpecifiques
    ).nombre(),
    fonctionnalites: description.fonctionnalites,
    fonctionnalitesSpecifiques: (
      description.fonctionnalitesSpecifiques as FonctionnalitesSpecifiques
    ).nombre(),
    localisationDonnees: description.localisationDonnees,
    nombreOrganisationsUtilisatrices: {
      borneBasse: nombreOuUn(borneBasse),
      borneHaute: nombreOuUn(borneHaute),
    },
    provenanceService: description.provenanceService,
  };
};
