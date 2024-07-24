import { expect, test, vi } from 'vitest';
import { get } from 'svelte/store';
import { storeNotifications } from '../../../lib/ui/stores/notifications.store';
import axios from 'axios';
import adaptateurAjaxAxios from '../../../../public/modules/adaptateurAjaxAxios.mjs';

test('le store est initialisé avec un tableau vide', () => {
  const notifications = get(storeNotifications);

  expect(notifications).toStrictEqual([]);
});

test('peut rafraichir les notifications du store', async () => {
  vi.mock('axios');
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
