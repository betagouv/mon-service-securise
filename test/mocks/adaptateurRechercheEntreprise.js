const fauxAdaptateurRechercheEntreprise = () => ({
  rechercheOrganisations: async (siret) => [
    { nom: 'NomEntite', departement: '33', siret },
  ],
  recupereDetailsOrganisation: async () => ({
    estServicePublic: false,
    estFiness: false,
    estEss: true,
    estEntrepreneurIndividuel: false,
    collectiviteTerritoriale: null,
    estAssociation: false,
    categorieEntreprise: null,
    activitePrincipale: '68.20B',
    trancheEffectifSalarie: null,
    natureJuridique: '6540',
    sectionActivitePrincipale: 'L',
    anneeTrancheEffectifSalarie: null,
    commune: '33376',
    departement: '33',
  }),
});

module.exports = fauxAdaptateurRechercheEntreprise;
