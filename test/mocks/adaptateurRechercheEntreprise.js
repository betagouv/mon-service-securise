const fauxAdaptateurRechercheEntreprise = () => ({
  rechercheOrganisations: async (siret) => [
    { nom: 'NomEntite', departement: '33', siret },
  ],
  recupereDetailsOrganisation: async () => ({
    natureJuridique: '7210',
    categorieEntreprise: 'ETI',
    trancheEffectifSalarie: '41',
    finances: null,
    complements: {
      collectiviteTerritoriale: {
        code: '86066',
        code_insee: '86066',
        elus: [],
        niveau: 'Commune',
      },
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: true,
    },
    sectionActivitePrincipale: 'O',
    departement: '86',
    region: '75',
  }),
});

export default fauxAdaptateurRechercheEntreprise;
