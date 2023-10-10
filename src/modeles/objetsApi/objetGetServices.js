const Dossiers = require('../dossiers');
const objetGetService = require('./objetGetService');
const AutorisationBase = require('../autorisations/autorisationBase');

const { DROITS_VOIR_STATUT_HOMOLOGATION } = AutorisationBase;

const donnees = (services, autorisations, idUtilisateur, referentiel) => ({
  services: services.map((s) =>
    objetGetService.donnees(
      s,
      autorisations.find((a) => a.idService === s.id),
      idUtilisateur,
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
  },
});

module.exports = { donnees };
