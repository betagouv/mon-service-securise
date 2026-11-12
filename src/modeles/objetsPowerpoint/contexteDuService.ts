import { DescriptionServiceV2 } from '../descriptionServiceV2.js';
import Entite from '../entite.js';

export type ContexteDuService = {
  description?: string;
  organisation: string;
  statut: string;
  urls: string;
};

const siretFormate = (siret: string) =>
  siret.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4');

const organisation = ({ nom, siret }: Entite) =>
  nom ? `${nom} (${siretFormate(siret)})` : siretFormate(siret);

export const contexteDuService = (
  description: DescriptionServiceV2
): ContexteDuService => ({
  description: description.presentation,
  organisation: organisation(description.organisationResponsable),
  statut: description.descriptionStatutDeploiement(),
  urls: description.pointsAcces.descriptions().join(', '),
});
