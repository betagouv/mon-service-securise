import { get } from 'svelte/store';
import { storeNotifications } from '../../../lib/ui/stores/notifications.store';
import axios from 'axios';

vi.mock('axios');

const globalAny: Record<string, unknown> = global;

describe('Le store de notifications', () => {
  beforeAll(() => {
    globalAny.axios = axios;
  });

  afterAll(() => {
    delete globalAny.axios;
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

  describe('sur demande de suppression', () => {
    const notificationASupprimer = {
      id: 'ID1',
      type: 'mention',
      canalDiffusion: 'centreNotifications',
    };
    const notificationAConserver = {
      id: 'ID2',
      type: 'nouveaute',
      canalDiffusion: 'centreNotifications',
    };

    beforeEach(async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          notifications: [notificationASupprimer, notificationAConserver],
        },
      });
      await storeNotifications.rafraichis();
      vi.mocked(axios.get).mockClear();
    });

    const idsDuCentreNotifications = () =>
      get(storeNotifications).pourCentreNotifications.map((n) => n.id);

    it('retire la notification du store sans attendre la réponse du serveur', () => {
      vi.mocked(axios.delete).mockReturnValue(new Promise(() => {}));

      storeNotifications.supprime('mention', 'ID1');

      expect(idsDuCentreNotifications()).toStrictEqual(['ID2']);
    });

    it('appelle la route de suppression correspondant au type de notification', async () => {
      vi.mocked(axios.delete).mockResolvedValue({});

      await storeNotifications.supprime('mention', 'ID1');

      expect(vi.mocked(axios.delete)).toHaveBeenCalledWith(
        '/api/notifications/transactionnelles/ID1'
      );
    });

    it('ne rafraichit pas le store si la suppression réussit', async () => {
      vi.mocked(axios.delete).mockResolvedValue({});

      await storeNotifications.supprime('mention', 'ID1');

      expect(vi.mocked(axios.get)).not.toHaveBeenCalled();
      expect(idsDuCentreNotifications()).toStrictEqual(['ID2']);
    });

    it('considère une notification déjà supprimée (404) comme une suppression réussie', async () => {
      vi.mocked(axios.delete).mockRejectedValue({ response: { status: 404 } });

      await storeNotifications.supprime('mention', 'ID1');

      expect(vi.mocked(axios.get)).not.toHaveBeenCalled();
      expect(idsDuCentreNotifications()).toStrictEqual(['ID2']);
    });

    it('rafraichit le store depuis le serveur si la suppression échoue', async () => {
      vi.mocked(axios.delete).mockRejectedValue({ response: { status: 500 } });

      await storeNotifications.supprime('mention', 'ID1');

      expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/notifications');
      expect(idsDuCentreNotifications()).toStrictEqual(['ID1', 'ID2']);
    });
  });
});
