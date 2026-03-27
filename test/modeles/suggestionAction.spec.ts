import SuggestionAction from '../../src/modeles/suggestionAction.js';
import { creeReferentiel } from '../../src/referentiel.js';

describe("Une suggestion d'action", () => {
  it('possède un lien', () => {
    const r = creeReferentiel({
      naturesSuggestionsActions: {
        // @ts-expect-error On utilise une nature factice
        natureDeTest: { lien: '/service' },
      },
    });

    // @ts-expect-error On utilise une nature factice
    const s = new SuggestionAction({ nature: 'natureDeTest' }, r);

    expect(s.lien).toBe('/service');
  });
});
