import { schemaService } from '../../http/schemas/service.schema.js';
import { ReferentielV2 } from '../../referentiel.interface.js';

export const schemaPutDescriptionService = (referentielV2: ReferentielV2) => ({
  delaiAvantImpactCritique:
    schemaService.delaiAvantImpactCritique(referentielV2),
  donneesCaracterePersonnel:
    schemaService.donneesCaracterePersonnel(referentielV2),
  donneesSensiblesSpecifiques: schemaService.donneesSensiblesSpecifiques(),
  fonctionnalites: schemaService.fonctionnalites(referentielV2),
  fonctionnalitesSpecifiques: schemaService.fonctionnalitesSpecifiques(),
  localisationDonnees: schemaService.localisationDonnees(referentielV2),
  niveauSecurite: schemaService.niveauSecurite(referentielV2),
  nomService: schemaService.nomService(),
  nombreOrganisationsUtilisatrices:
    schemaService.nombreOrganisationsUtilisatrices(),
  organisationResponsable: schemaService.organisationResponsable(),
  pointsAcces: schemaService.pointsAcces(),
  presentation: schemaService.presentation(),
  provenanceService: schemaService.provenanceService(referentielV2),
  statutDeploiement: schemaService.statutDeploiement(referentielV2),
  typeService: schemaService.typeService(referentielV2),
});
