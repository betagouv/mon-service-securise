const Dossiers = require('../dossiers');
const objetGetService = require('./objetGetService');
const { Permissions, Rubriques } = require('../autorisations/gestionDroits');

const { LECTURE } = Permissions;
const { HOMOLOGUER } = Rubriques;

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
          .aLaPermission(LECTURE, HOMOLOGUER)
    ).length,
  },
});

module.exports = { donnees };
