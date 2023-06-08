const {
  MiseAJourDescriptionService,
} = require('./miseAJourDescriptionService');

const fabriqueCasUsagesReels = (depotDonnees, adaptateurJournalMSS) => ({
  miseAJourDescriptionService: () =>
    new MiseAJourDescriptionService(depotDonnees, adaptateurJournalMSS),
});

module.exports = { fabriqueCasUsagesReels };
