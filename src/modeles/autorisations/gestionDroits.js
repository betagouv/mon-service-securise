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

module.exports = { Permissions, Rubriques, toutDroitsEnEcriture };
