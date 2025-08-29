export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type SIRET = string;

export type Organisation = {
  nom: string;
  departement: string;
  siret: SIRET;
};

interface ServiceAnnuaire {
  rechercheOrganisations(
    terme: string,
    departement: string
  ): Promise<Organisation[]>;

  rechercheContributeurs(
    idUtilisateur: UUID,
    recherche: string
  ): Promise<object[]>;
}

const fabriqueAnnuaire = ({
  adaptateurRechercheEntreprise,
  depotDonnees,
}): ServiceAnnuaire => ({
  rechercheOrganisations: async (terme, departement) =>
    adaptateurRechercheEntreprise.rechercheOrganisations(terme, departement),
  rechercheContributeurs: async (idUtilisateur, recherche) =>
    depotDonnees.rechercheContributeurs(idUtilisateur, recherche),
});

export { fabriqueAnnuaire };
