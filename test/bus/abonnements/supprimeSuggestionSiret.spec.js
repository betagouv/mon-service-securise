const expect = require('expect.js');
const {
  supprimeSuggestionSiret,
} = require('../../../src/bus/abonnements/supprimeSuggestionSiret');
const { unService } = require('../../constructeurs/constructeurService');

describe('L’abonnement qui supprime la suggestion de mise à jour du SIRET', () => {
  it('utilise le dépôt pour supprimer la suggestion', async () => {
    let suggestionSupprimee;
    const depotDonnees = {
      acquitteSuggestionAction: (idService, nature) => {
        suggestionSupprimee = { idService, nature };
      },
    };

    const abonne = supprimeSuggestionSiret({ depotDonnees });

    expect(abonne).to.be.an('function');
    await abonne({
      service: unService().avecId('S1').construis(),
    });
    expect(suggestionSupprimee).to.eql({
      idService: 'S1',
      nature: 'miseAJourSiret',
    });
  });
});
