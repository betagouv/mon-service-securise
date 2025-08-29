import expect from 'expect.js';
import * as depotDonneesSuggestionsActions from '../../src/depots/depotDonneesSuggestionsActions.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';

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

  it('peut ajouter une suggestion', async () => {
    let persistanceAppelee = {};
    adaptateurPersistance.ajouteSuggestionAction = async ({
      idService,
      nature,
    }) => {
      persistanceAppelee = { idService, nature };
    };

    await depot.ajouteSuggestionAction('S1', 'SIRET');

    expect(persistanceAppelee).to.eql({ idService: 'S1', nature: 'SIRET' });
  });

  it('peut supprimer une suggestion', async () => {
    let idRecu = {};
    adaptateurPersistance.supprimeSuggestionsActionsPourService = async (
      idService
    ) => {
      idRecu = idService;
    };

    await depot.supprimeSuggestionsActionsPourService('S1');

    expect(idRecu).to.eql('S1');
  });
});
