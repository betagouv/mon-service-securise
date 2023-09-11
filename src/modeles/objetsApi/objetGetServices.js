const Dossiers = require('../dossiers');
const objetGetService = require('./objetGetService');

const donnees = (services, idUtilisateur, referentiel) => ({
  services: services.map((s) =>
    objetGetService.donnees(s, idUtilisateur, referentiel)
  ),
  resume: {
    nombreServices: services.length,
    nombreServicesHomologues: services.filter(
      (s) =>
        s.dossiers.statutHomologation() === Dossiers.ACTIVEE ||
        s.dossiers.statutHomologation() === Dossiers.BIENTOT_EXPIREE
    ).length,
  },
});

module.exports = { donnees };
