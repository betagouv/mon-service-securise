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

const toutDroitsEnEcriture = () =>
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
  toutDroitsEnEcriture,
  verifieCoherenceDesDroits,
};
