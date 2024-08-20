const Utilisateur = require('../modeles/utilisateur');

const fabriqueAnnuaire = ({ adaptateurRechercheEntreprise, depotDonnees }) => ({
  rechercheOrganisations: async (terme, departement) =>
    adaptateurRechercheEntreprise.rechercheOrganisations(terme, departement),
  rechercheContributeurs: async (idUtilisateur, recherche) => {
    const contributeurs = await depotDonnees.rechercheContributeurs(
      idUtilisateur,
      recherche
    );

    return contributeurs.map((c) => new Utilisateur(c));
  },
});

module.exports = { fabriqueAnnuaire };
