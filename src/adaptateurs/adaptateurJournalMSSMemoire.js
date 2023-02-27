const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const nouvelAdaptateur = () => {
  const consigneEvenement = (donneesEvenements) => {
    /* eslint-disable no-console */
    const logDansConsole = adaptateurEnvironnement.journalMSS().logEvenementDansConsole();
    if (logDansConsole) console.log(`[JOURNAL MSS] Nouvel événement\n${JSON.stringify(donneesEvenements)}`);
    /* eslint-enable no-console */

    return Promise.resolve();
  };

  return {
    consigneEvenement,
  };
};

module.exports = { nouvelAdaptateur };
