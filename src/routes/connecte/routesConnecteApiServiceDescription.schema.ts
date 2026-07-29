import { schemaService } from '../../http/schemas/service.schema.js';
import { Referentiel } from '../../referentiel.interface.js';

export const schemaPutDescriptionService = (referentiel: Referentiel) => ({
  delaiAvantImpactCritique: schemaService.delaiAvantImpactCritique(referentiel),
  donneesCaracterePersonnel:
    schemaService.donneesCaracterePersonnel(referentiel),
  donneesSensiblesSpecifiques: schemaService.donneesSensiblesSpecifiques(),
  fonctionnalites: schemaService.fonctionnalites(referentiel),
  fonctionnalitesSpecifiques: schemaService.fonctionnalitesSpecifiques(),
  localisationDonnees: schemaService.localisationDonnees(referentiel),
  niveauSecurite: schemaService.niveauSecurite(referentiel),
  nomService: schemaService.nomService(),
  nombreOrganisationsUtilisatrices:
    schemaService.nombreOrganisationsUtilisatrices(),
  organisationResponsable: schemaService.organisationResponsable(),
  pointsAcces: schemaService.pointsAcces(),
  presentation: schemaService.presentation(),
  provenanceService: schemaService.provenanceService(referentiel),
  statutDeploiement: schemaService.statutDeploiement(referentiel),
  typeService: schemaService.typeService(referentiel),
});

export const schemaPostEstimationNiveauSecurite = (
  referentiel: Referentiel
) => ({
  delaiAvantImpactCritique: schemaService.delaiAvantImpactCritique(referentiel),
  donneesCaracterePersonnel:
    schemaService.donneesCaracterePersonnel(referentiel),
  donneesSensiblesSpecifiques: schemaService.donneesSensiblesSpecifiques(),
  fonctionnalites: schemaService.fonctionnalites(referentiel),
  fonctionnalitesSpecifiques: schemaService.fonctionnalitesSpecifiques(),
  localisationDonnees: schemaService.localisationDonnees(referentiel),
  nomService: schemaService.nomService(),
  nombreOrganisationsUtilisatrices:
    schemaService.nombreOrganisationsUtilisatrices(),
  organisationResponsable: schemaService.organisationResponsable(),
  pointsAcces: schemaService.pointsAcces(),
  presentation: schemaService.presentation(),
  provenanceService: schemaService.provenanceService(referentiel),
  statutDeploiement: schemaService.statutDeploiement(referentiel),
  typeService: schemaService.typeService(referentiel),
});
