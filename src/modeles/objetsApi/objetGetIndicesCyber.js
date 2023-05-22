const donnees = (services) => {
  const servicesIndiceCyberCalcules = services.map((s) => ({
    id: s.id,
    indiceCyber: s.indiceCyber().total,
  }));

  const servicesAvecIndiceCyber = servicesIndiceCyberCalcules.filter(
    (s) => s.indiceCyber > 0
  );

  const indiceCyberMoyen =
    servicesIndiceCyberCalcules
      .map((s) => s.indiceCyber)
      .reduce((a, b) => a + b, 0) / servicesAvecIndiceCyber.length;

  return {
    services: servicesIndiceCyberCalcules.map((s) => ({
      ...s,
      indiceCyber: s.indiceCyber.toFixed(1),
    })),
    resume: { indiceCyberMoyen },
  };
};

module.exports = { donnees };
