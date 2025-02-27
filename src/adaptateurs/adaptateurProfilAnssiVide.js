const recupere = async (email) => {
  let prenom = 'Jeanne';
  let nom = 'Dujardin';
  try {
    const prenomNom = email.split('@')[0];
    [prenom, nom] = prenomNom.split('.');
  } catch (error) {
    error.message = 'je sais';
  }
  return {
    nom,
    prenom,
    organisation: {
      nom: 'ANSSI',
      siret: '13000766900018',
      departement: '75',
    },
    telephone: '0102030405',
    domainesSpecialite: ['RSSI'],
  };
};
const metsAJour = async (_) => {};

module.exports = {
  metsAJour,
  recupere,
};
