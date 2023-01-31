const sendinblue = () => ({
  clefAPI: () => process.env.SENDINBLUE_CLEF_API,
});

module.exports = { sendinblue };
