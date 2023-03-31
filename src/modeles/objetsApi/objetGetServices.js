const donnees = (services) => ({
  services: services
    .map((s) => ({
      ...s.toJSON(),
      organisationsResponsables: s.descriptionService.organisationsResponsables,
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
    })),
});

module.exports = { donnees };
