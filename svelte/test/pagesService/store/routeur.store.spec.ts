import { get } from 'svelte/store';

describe('Le routeur des pages service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const leRouteur = async () => {
    const routeur =
      await import('../../../lib/pagesService/store/routeur.store');
    return routeur.routeurStore;
  };

  it("s'initialise avec `window.location`", async () => {
    window.history.pushState({}, '', '/service/1234');

    const routeurStore = await leRouteur();

    expect(get(routeurStore).location).toBe('/service/1234');
  });

  it('mets à jour sa location quand un évènement popstate intervient', async () => {
    window.history.pushState({}, '', '/service/1234');
    const routeurStore = await leRouteur();

    window.history.pushState({}, '', '/service/5678');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(get(routeurStore).location).toBe('/service/5678');
  });

  it('peut naviguer vers une url', async () => {
    const routeurStore = await leRouteur();

    routeurStore.navigue('/service/1234/url');

    expect(get(routeurStore).location).toBe('/service/1234/url');
  });
});
