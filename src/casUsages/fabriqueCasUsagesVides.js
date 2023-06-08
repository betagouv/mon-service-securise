const fabriqueCasUsagesVides = () => ({
  miseAJourDescriptionService: () => ({
    execute: () => Promise.resolve(),
  }),
});

module.exports = { fabriqueCasUsagesVides };
