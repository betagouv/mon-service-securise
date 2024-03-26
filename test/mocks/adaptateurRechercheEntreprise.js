const fauxAdaptateurRechercheEntreprise = () => ({
  rechercheOrganisations: async (siret) => [
    { nom: 'NomEntite', departement: '33', siret },
  ],
});

module.exports = fauxAdaptateurRechercheEntreprise;
