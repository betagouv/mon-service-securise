const expect = require('expect.js');
const {
  supprimeSuggestionsSurDesChampsObligatoires,
} = require('../../../src/bus/abonnements/supprimeSuggestionsSurDesChampsObligatoires');
const { unService } = require('../../constructeurs/constructeurService');

describe('L’abonnement qui supprime les suggestions portant sur des données obligatoires', () => {
  it('utilise le dépôt pour supprimer la suggestion de mise à jour du SIRET', async () => {
    let suggestionSupprimee;
    const depotDonnees = {
      acquitteSuggestionAction: (idService, nature) => {
        suggestionSupprimee = { idService, nature };
      },
    };

    const abonne = supprimeSuggestionsSurDesChampsObligatoires({
      depotDonnees,
    });

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
