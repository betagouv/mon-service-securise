const Utilisateur = require('../modeles/utilisateur');

const fabriqueAnnuaire = ({
  adaptateurRechercheEntreprise,
  adaptateurPersistance,
}) => ({
  rechercheOrganisations: async (terme, departement) =>
    adaptateurRechercheEntreprise.rechercheOrganisations(terme, departement),
  rechercheContributeurs: async (idUtilisateur, recherche) => {
    const contributeurs = await adaptateurPersistance.rechercheContributeurs(
      idUtilisateur,
      recherche
    );

    return contributeurs.map((c) => new Utilisateur(c));
  },
});

module.exports = { fabriqueAnnuaire };
