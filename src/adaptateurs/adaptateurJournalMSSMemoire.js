const nouvelAdaptateur = () => {
  const consigneEvenement = (donneesEvenements) => {
    /* eslint-disable no-console */
    console.log(`[JOURNAL MSS] Nouvel événement\n${JSON.stringify(donneesEvenements)}`);
    return Promise.resolve();
    /* eslint-enable no-console */
  };

  return {
    consigneEvenement,
  };
};

module.exports = { nouvelAdaptateur };
