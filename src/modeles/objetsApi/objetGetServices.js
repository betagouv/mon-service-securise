const Dossiers = require('../dossiers');
const objetGetService = require('./objetGetService');
const Autorisation = require('../autorisations/autorisation');

const { DROITS_VOIR_STATUT_HOMOLOGATION } = Autorisation;

const donnees = (services, autorisations, referentiel) => ({
  services: services.map((s) =>
    objetGetService.donnees(
      s,
      autorisations.find((a) => a.idService === s.id),
      referentiel
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

module.exports = { donnees };
