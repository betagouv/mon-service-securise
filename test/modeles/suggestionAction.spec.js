const expect = require('expect.js');
const SuggestionAction = require('../../src/modeles/suggestionAction');
const { creeReferentiel } = require('../../src/referentiel');

describe("Une suggestion d'action", () => {
  it('possède un lien', () => {
    const r = creeReferentiel({
      naturesSuggestionsActions: {
        natureDeTest: { lien: '/service' },
      },
    });

    const s = new SuggestionAction({ nature: 'natureDeTest' }, r);

    expect(s.lien).to.be('/service');
  });
});
