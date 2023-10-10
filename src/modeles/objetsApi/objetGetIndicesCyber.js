const AutorisationBase = require('../autorisations/autorisationBase');

const { DROITS_VOIR_INDICE_CYBER } = AutorisationBase;

const donnees = (services, autorisations) => {
  const servicesIndiceCyberCalcules = services.map((s) => ({
    id: s.id,
    ...(autorisations
      .find((a) => a.idService === s.id)
      .aLesPermissions(DROITS_VOIR_INDICE_CYBER) && {
      indiceCyber: s.indiceCyber().total,
    }),
  }));

  const servicesAvecIndiceCyber = servicesIndiceCyberCalcules.filter(
    (s) => s.indiceCyber && s.indiceCyber > 0
  );

  const indiceCyberMoyen =
    servicesAvecIndiceCyber
      .map((s) => s.indiceCyber)
      .reduce((a, b) => a + b, 0) / servicesAvecIndiceCyber.length;

  return {
    services: servicesIndiceCyberCalcules.map((s) => ({
      ...s,
      ...(s.indiceCyber && { indiceCyber: s.indiceCyber.toFixed(1) }),
    })),
    resume: {
      indiceCyberMoyen: Number.isNaN(indiceCyberMoyen)
        ? '-'
        : indiceCyberMoyen?.toFixed(1),
    },
  };
};

module.exports = { donnees };
