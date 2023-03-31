const donnees = (services) => ({
  services: services
    .map((s) => s.toJSON())
    .map((json) => ({
      id: json.id,
      nomService: json.nomService,
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
