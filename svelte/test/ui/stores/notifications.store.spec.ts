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

  it('est initialisé avec un tableau vide', () => {
    const notifications = get(storeNotifications);

    expect(notifications).toStrictEqual([]);
  });

  it('peut rafraichir les notifications du store', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { notifications: [{ type: 'nouveaute', titre: "C'est nouveau" }] },
    });

    await storeNotifications.rafraichis();

    const notifications = get(storeNotifications);
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('nouveaute');
    expect(notifications[0].titre).toBe("C'est nouveau");
    expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/notifications');
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
