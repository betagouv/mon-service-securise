import expect from 'expect.js';
import SuggestionAction from '../../src/modeles/suggestionAction.js';
import { creeReferentiel } from '../../src/referentiel.js';

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
