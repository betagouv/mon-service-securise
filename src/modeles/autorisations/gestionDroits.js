const Permissions = {
  ECRITURE: 2,
  LECTURE: 1,
  INVISIBLE: 0,
};

const Rubriques = {
  DECRIRE: 'DECRIRE',
  SECURISER: 'SECURISER',
  HOMOLOGUER: 'HOMOLOGUER',
  RISQUES: 'RISQUES',
  CONTACTS: 'CONTACTS',
};

const premiereRouteDisponible = (autorisation) => {
  const routeParRubrique = [
    { rubrique: Rubriques.DECRIRE, route: '/descriptionService' },
    { rubrique: Rubriques.SECURISER, route: '/mesures' },
    { rubrique: Rubriques.HOMOLOGUER, route: '/dossiers' },
    { rubrique: Rubriques.RISQUES, route: '/risques' },
    { rubrique: Rubriques.CONTACTS, route: '/rolesResponsabilites' },
  ];
  const { LECTURE } = Permissions;

  return routeParRubrique.find(({ rubrique }) =>
    autorisation.aLaPermission(LECTURE, rubrique)
  )?.route;
};

const tousDroitsEnEcriture = () =>
  Object.values(Rubriques).reduce(
    (droits, rubrique) => ({ ...droits, [rubrique]: Permissions.ECRITURE }),
    {}
  );

const verifieCoherenceDesDroits = (droits) =>
  Object.entries(droits).every(([rubrique, niveau]) => {
    const rubriqueExiste = Object.values(Rubriques).includes(rubrique);
    const niveauExiste = Object.values(Permissions).includes(niveau);
    return rubriqueExiste && niveauExiste;
  });

module.exports = {
  Permissions,
  Rubriques,
  premiereRouteDisponible,
  tousDroitsEnEcriture,
  verifieCoherenceDesDroits,
};
