const donnees = (services) => {
  const servicesAvecIndiceCyber = services
    .filter((s) => s.indiceCyber().total > 0);

  return {
    services: services
      .map((s) => ({
        ...s.toJSON(),
        organisationsResponsables: s.descriptionService.organisationsResponsables,
        indiceCyber: s.indiceCyber().total.toFixed(1),
        statutHomologation: s.dossiers.statutSaisie(),
      }))
      .map((json) => ({
        id: json.id,
        nomService: json.nomService,
        organisationsResponsables: json.organisationsResponsables ?? [],
        createur: {
          id: json.createur.id,
          prenomNom: json.createur.prenomNom,
          initiales: json.createur.initiales,
        },
        contributeurs: json.contributeurs.map((c) => ({
          id: c.id,
          prenomNom: c.prenomNom,
          initiales: c.initiales,
          cguAcceptees: c.cguAcceptees,
        })),
        indiceCyber: json.indiceCyber,
        statutHomologation: json.statutHomologation,
      })),
    resume: {
      nombreServices: services.length,
      nombreServicesHomologues: services.filter((s) => s.dossiers.statutSaisie() === 'completes').length,
      indiceCyberMoyen: servicesAvecIndiceCyber
        .map((s) => s.indiceCyber().total)
        .reduce((a, b) => a + b, 0) / servicesAvecIndiceCyber.length,
    },
  };
};

module.exports = { donnees };
