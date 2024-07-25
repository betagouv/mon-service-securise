import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { get } from 'svelte/store';
import { nouveautesPage } from '../../../lib/ui/stores/nouveautesPage.store';
import axios from 'axios';
import { storeNotifications } from '../../../lib/ui/stores/notifications.store';

const globalAny: any = global;

describe('Le store dérivé des nouveautes de page', () => {
  beforeAll(() => {
    globalAny.axios = axios;
  });

  afterAll(() => {
    delete globalAny.axios;
  });

  beforeEach(() => {
    vi.mock('axios');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sur demande s'il doit afficher une nouveauté", () => {
    it('répond `non` si la nouveauté n’existe pas', () => {
      const reponse =
        get(nouveautesPage).doitAfficherNouveautePourPage('nouveaute-inconnue');

      expect(reponse).toBe(false);
    });

    it("répond `oui` si la nouveauté existe et n'a pas été lue", async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          notifications: [
            {
              id: 'ma-nouveaute',
              type: 'nouveaute',
              canalDiffusion: 'page',
              statutLecture: 'nonLue',
            },
          ],
        },
      });
      await storeNotifications.rafraichis();

      const reponse =
        get(nouveautesPage).doitAfficherNouveautePourPage('ma-nouveaute');

      expect(reponse).toBe(true);
    });

    it('répond `non` si la nouveauté existe et a été lue', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          notifications: [
            {
              id: 'ma-nouveaute',
              type: 'nouveaute',
              canalDiffusion: 'page',
              statutLecture: 'lue',
            },
          ],
        },
      });
      await storeNotifications.rafraichis();

      const reponse =
        get(nouveautesPage).doitAfficherNouveautePourPage('ma-nouveaute');

      expect(reponse).toBe(false);
    });
  });
});
