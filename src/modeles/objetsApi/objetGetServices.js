const donnees = (services, idUtilisateur, referentiel) => ({
  services: services
    .map((s) => ({
      ...s.toJSON(),
      organisationsResponsables: s.descriptionService.organisationsResponsables,
      statutHomologation: s.dossiers.statutHomologation(),
      documentsPdfDisponibles: s.documentsPdfDisponibles(),
    }))
    .map((json) => ({
      id: json.id,
      nomService: json.nomService,
      organisationsResponsables: json.organisationsResponsables ?? [],
      createur: {
        id: json.createur.id,
        prenomNom: json.createur.prenomNom,
        initiales: json.createur.initiales,
        poste: json.createur.posteDetaille,
      },
      contributeurs: json.contributeurs.map((c) => ({
        id: c.id,
        prenomNom: c.prenomNom,
        initiales: c.initiales,
        cguAcceptees: c.cguAcceptees,
        poste: c.posteDetaille,
      })),
      statutHomologation: {
        id: json.statutHomologation,
        ...referentiel.statutHomologation(json.statutHomologation),
      },
      nombreContributeurs: json.contributeurs.length + 1,
      estCreateur: json.createur.id === idUtilisateur,
      documentsPdfDisponibles: json.documentsPdfDisponibles,
    })),
  resume: {
    nombreServices: services.length,
    nombreServicesHomologues: services.filter(
      (s) => s.dossiers.statutSaisie() === 'completes'
    ).length,
  },
});

module.exports = { donnees };
