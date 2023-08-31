const fabriqueAnnuaire = ({ adaptateurRechercheEntreprise }) => ({
  rechercheOrganisation: adaptateurRechercheEntreprise.rechercheOrganisation,
});

module.exports = { fabriqueAnnuaire };
