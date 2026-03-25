import { get } from 'svelte/store';
import { storeVraisemblanceRisqueV2 } from '../../../lib/ui/stores/vraisemblanceRisqueV2.store';
import axios from 'axios';
import { toasterStore } from '../../../lib/ui/stores/toaster.store';

const globalAny: Record<string, unknown> = global;

describe('Le store des vraisemblances de risque v2', () => {
  beforeAll(() => {
    globalAny.axios = axios;
  });

  afterAll(() => {
    delete globalAny.axios;
  });

  beforeEach(() => {
    vi.mock('axios');
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        risques: [
          { id: 'R1', vraisemblance: 4 },
          { id: 'R2', vraisemblance: 4 },
        ],
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('peut charger les vraisemblances de risque v2 pour un service', async () => {
    await storeVraisemblanceRisqueV2.rafraichis('S1');

    const vraisemblances = get(storeVraisemblanceRisqueV2);
    expect(vraisemblances).toEqual({ R1: 4, R2: 4 });
  });

  it("ajoute un toast si une vraisemblance est modifiée à la suite d'un rafraîchissement", async () => {
    await storeVraisemblanceRisqueV2.rafraichis('S1');
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        risques: [
          { id: 'R1', vraisemblance: 3 },
          { id: 'R2', vraisemblance: 2 },
        ],
      },
    });

    await storeVraisemblanceRisqueV2.rafraichis('S1');

    const toasts = get(toasterStore);
    expect(toasts.queue[0].niveau).toBe('info');
    expect(toasts.queue[0].titre).toBe(
      'Cartographie de risques de sécurité mise à jour'
    );
    expect(toasts.queue[0].contenu).toBe(
      "Le risque R1 est passé d'une vraisemblance 4 à 3.<br/>Le risque R2 est passé d'une vraisemblance 4 à 2."
    );
  });
});
