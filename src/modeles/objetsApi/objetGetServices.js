import Dossiers from '../dossiers.js';
import * as objetGetService from './objetGetService.js';
import { Autorisation } from '../autorisations/autorisation.js';

const { DROITS_VOIR_STATUT_HOMOLOGATION } = Autorisation;

const donnees = (
  services,
  autorisations,
  referentiel,
  adaptateurEnvironnement
) => ({
  services: services.map((s) =>
    objetGetService.donnees(
      s,
      autorisations.find((a) => a.idService === s.id),
      referentiel,
      adaptateurEnvironnement
    )
  ),
  resume: {
    nombreServices: services.length,
    nombreServicesHomologues: services.filter(
      (s) =>
        (s.dossiers.statutHomologation() === Dossiers.ACTIVEE ||
          s.dossiers.statutHomologation() === Dossiers.BIENTOT_EXPIREE) &&
        autorisations
          .find((a) => a.idService === s.id)
          .aLesPermissions(DROITS_VOIR_STATUT_HOMOLOGATION)
    ).length,
    nombreHomologationsExpirees: services.filter(
      (s) =>
        s.dossiers.statutHomologation() === Dossiers.EXPIREE &&
        autorisations
          .find((a) => a.idService === s.id)
          .aLesPermissions(DROITS_VOIR_STATUT_HOMOLOGATION)
    ).length,
  },
});

export { donnees };
