const nouvelAdaptateur = () => {
  const donnees = { evenements: [] };

  const consigneEvenement = (donneesEvenements) => {
    donnees.evenements.push(donneesEvenements);
    return Promise.resolve();
  };

  return {
    consigneEvenement,
  };
};

module.exports = { nouvelAdaptateur };
