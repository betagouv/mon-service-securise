import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  vi,
  describe,
  it,
} from 'vitest';
import { get } from 'svelte/store';
import { storeNotifications } from '../../../lib/ui/stores/notifications.store';
import axios from 'axios';

const globalAny: any = global;

describe('Le store de notifications', () => {
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

  it('est initialisé avec un objet comportant les notifications pour le centre de notifications et pour les pages', () => {
    const notifications = get(storeNotifications);

    expect(notifications.pourCentreNotifications).toStrictEqual([]);
    expect(notifications.pourPage).toStrictEqual([]);
  });

  describe('sur demande de rafraichissement des notifications', () => {
    it('met à jour ses notifications en séparant celles du centre de notifications et celles des pages', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          notifications: [
            {
              id: 'ID1',
              type: 'nouveaute',
              titre: "C'est nouveau",
              canalDiffusion: 'centreNotifications',
            },
            {
              id: 'ID2',
              type: 'nouveaute',
              canalDiffusion: 'page',
            },
          ],
        },
      });

      await storeNotifications.rafraichis();

      const notifications = get(storeNotifications);
      expect(notifications.pourCentreNotifications.length).toBe(1);
      expect(notifications.pourCentreNotifications[0].id).toBe('ID1');
      expect(notifications.pourCentreNotifications[0].type).toBe('nouveaute');
      expect(notifications.pourCentreNotifications[0].titre).toBe(
        "C'est nouveau"
      );
      expect(notifications.pourPage.length).toBe(1);
      expect(notifications.pourPage[0].id).toBe('ID2');
      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/notifications');
    });
  });

  describe('sur demande de marquage à "lue"', () => {
    beforeEach(() => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { notifications: [] },
      });
    });

    it('marque la notification comme lue', async () => {
      await storeNotifications.marqueLue('nouveaute', 'encartHomologation');

      expect(vi.mocked(axios.put)).toHaveBeenCalledOnce();
      expect(vi.mocked(axios.put)).toHaveBeenCalledWith(
        '/api/notifications/nouveautes/encartHomologation'
      );
    });

    it('rafraichit le store', async () => {
      await storeNotifications.marqueLue('nouveaute', 'encartHomologation');

      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/notifications');
    });
  });
});
