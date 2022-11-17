const nouvelAdaptateur = () => {
  const donnees = { evenements: [] };

  const consigneEvenement = (evenement) => {
    donnees.evenements.push(evenement);
    return Promise.resolve();
  };

  return {
    consigneEvenement,
  };
};

module.exports = { nouvelAdaptateur };
