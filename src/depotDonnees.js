const Homologation = require('./modeles/homologation');

const creeDepot = (donnees) => {
  const homologations = (idUtilisateur) => donnees.homologations
    .filter((h) => h.idUtilisateur === idUtilisateur)
    .map((h) => new Homologation(h));

  return { homologations };
};

const creeDepotVide = () => creeDepot({ homologations: [] });

module.exports = { creeDepot, creeDepotVide };
