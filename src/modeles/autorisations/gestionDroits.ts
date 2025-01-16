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

const { LECTURE } = Permissions;
const { CONTACTS, SECURISER, RISQUES, HOMOLOGUER, DECRIRE } = Rubriques;

const premiereRouteDisponible = (autorisation, routesPersonnalisees = []) => {
  const routesParDefaut = [
    { rubrique: DECRIRE, route: '/descriptionService', niveau: LECTURE },
    { rubrique: SECURISER, route: '/mesures', niveau: LECTURE },
    { rubrique: HOMOLOGUER, route: '/dossiers', niveau: LECTURE },
    { rubrique: RISQUES, route: '/risques', niveau: LECTURE },
    { rubrique: CONTACTS, route: '/rolesResponsabilites', niveau: LECTURE },
  ];

  return [...routesPersonnalisees, ...routesParDefaut].find(
    ({ niveau, rubrique }) => autorisation.aLaPermission(niveau, rubrique)
  )?.route;
};

const tousDroitsEnEcriture = () =>
  Object.values(Rubriques).reduce(
    (droits, rubrique) => ({ ...droits, [rubrique]: Permissions.ECRITURE }),
    {}
  );

const verifieCoherenceDesDroits = (droits) => {
  if (droits.estProprietaire) return true;

  return Object.entries(droits).every(([rubrique, niveau]) => {
    const rubriqueExiste = Object.values(Rubriques).includes(rubrique);
    const niveauExiste = Object.values(Permissions).includes(niveau);
    return rubriqueExiste && niveauExiste;
  });
};

module.exports = {
  Permissions,
  Rubriques,
  premiereRouteDisponible,
  tousDroitsEnEcriture,
  verifieCoherenceDesDroits,
};
