const fabriqueAnnuaire = ({ adaptateurRechercheEntreprise, depotDonnees }) => ({
  rechercheOrganisations: async (terme, departement) =>
    adaptateurRechercheEntreprise.rechercheOrganisations(terme, departement),
  rechercheContributeurs: async (idUtilisateur, recherche) =>
    depotDonnees.rechercheContributeurs(idUtilisateur, recherche),
});

module.exports = { fabriqueAnnuaire };
