const expect = require('expect.js');
const depotDonneesSuggestionsActions = require('../../src/depots/depotDonneesSuggestionsActions');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');

describe("Le dépôt de données des suggestions d'actions", () => {
  let depot;
  let adaptateurPersistance;

  beforeEach(() => {
    adaptateurPersistance = unePersistanceMemoire().construis();
    depot = depotDonneesSuggestionsActions.creeDepot({ adaptateurPersistance });
  });

  it('horodate une suggestion acquittée', async () => {
    let persistanceAppelee = {};
    adaptateurPersistance.marqueSuggestionActionFaiteMaintenant = async (
      idService,
      nature
    ) => {
      persistanceAppelee = { idService, nature };
    };

    await depot.acquitteSuggestionAction('S1', 'SIRET');

    expect(persistanceAppelee).to.eql({ idService: 'S1', nature: 'SIRET' });
  });
});
