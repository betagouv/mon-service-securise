const nouvelAdaptateur = () => {
  const donnees = { evenements: [] };

  const consigneEvenement = (evenement) => {
    donnees.evenements.push(evenement);
    return Promise.resolve();
  };

  const evenements = () => donnees.evenements;

  return {
    consigneEvenement,
    evenements,
  };
};

module.exports = { nouvelAdaptateur };
