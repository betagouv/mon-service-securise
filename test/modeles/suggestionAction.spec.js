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

  it("peut injecter l'ID du service dans le lien", () => {
    const r = creeReferentiel({
      naturesSuggestionsActions: {
        natureDeTest: { lien: '/service/%ID_SERVICE%/page' },
      },
    });

    const s = new SuggestionAction(
      { nature: 'natureDeTest', idService: 'S1' },
      r
    );

    expect(s.lien).to.be('/service/S1/page');
  });
});
