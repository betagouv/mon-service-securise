const avecAccesEtapier = () => process.env.AVEC_ACCES_ETAPIER;

const sendinblue = () => ({
  clefAPI: () => process.env.SENDINBLUE_CLEF_API,
});

module.exports = { avecAccesEtapier, sendinblue };
