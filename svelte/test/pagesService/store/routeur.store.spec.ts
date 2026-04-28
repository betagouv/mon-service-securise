// @vitest-environment jsdom
import { get } from 'svelte/store';
import type { VersionService } from '../../../../src/modeles/versionService';
import { type InformationsService } from '../../../lib/pagesService/store/routeur.store';
import { pageCourante } from '../../../lib/pagesService/store/pageCourante.store';

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

  const chargeInformationsService = (
    routeurStore: Awaited<ReturnType<typeof leRouteur>>,
    informationsService: InformationsService = {
      visible: {
        rolesResponsabilites: true,
        risques: true,
        descriptionService: true,
        mesures: true,
        dossiers: true,
        indiceCyber: true,
        homologation: true,
      },
      version: 'v1' as VersionService,
    }
  ) => {
    routeurStore.chargeInformationsService(informationsService);
  };

  it("peut s'initialiser avec les informations d'un service", async () => {
    const routeurStore = await leRouteur();
    chargeInformationsService(routeurStore);

    expect(get(routeurStore).informationsService).toEqual({
      visible: {
        rolesResponsabilites: true,
        risques: true,
        descriptionService: true,
        mesures: true,
        dossiers: true,
        homologation: true,
        indiceCyber: true,
      },
      version: 'v1',
    });
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
    chargeInformationsService(routeurStore);

    routeurStore.navigue('/service/1234/mesures');

    expect(get(routeurStore).location).toBe('/service/1234/mesures');
  });

  describe('concernant les contraintes de navigation', () => {
    it("navigue en dehors de la SPA si la rubrique n'est pas visible", async () => {
      const routeurStore = await leRouteur();
      chargeInformationsService(routeurStore, {
        visible: {
          rolesResponsabilites: true,
          risques: true,
          descriptionService: true,
          mesures: false,
          dossiers: true,
          indiceCyber: true,
          homologation: true,
        },
        version: 'v1' as VersionService,
      });
      const navigueHorsSPA = vi.fn();

      routeurStore.navigue('/service/1234/mesures', navigueHorsSPA);

      expect(navigueHorsSPA).toHaveBeenCalledWith('/service/1234/mesures');
    });

    it("navigue en dehors de la SPA si la rubrique n'est pas gérée par la SPA", async () => {
      const routeurStore = await leRouteur();
      chargeInformationsService(routeurStore);
      const navigueHorsSPA = vi.fn();

      routeurStore.navigue('/service/1234/uneAutreRubrique', navigueHorsSPA);

      expect(navigueHorsSPA).toHaveBeenCalledWith(
        '/service/1234/uneAutreRubrique'
      );
    });

    it('navigue en dehors de la SPA si la rubrique `descriptionService` est demandée pour un service V1', async () => {
      const routeurStore = await leRouteur();
      chargeInformationsService(routeurStore, {
        visible: {
          rolesResponsabilites: true,
          risques: true,
          descriptionService: true,
          mesures: true,
          dossiers: true,
          indiceCyber: true,
          homologation: true,
        },
        version: 'v1' as VersionService,
      });
      const navigueHorsSPA = vi.fn();

      routeurStore.navigue('/service/1234/descriptionService', navigueHorsSPA);

      expect(navigueHorsSPA).toHaveBeenCalledWith(
        '/service/1234/descriptionService'
      );
    });
  });

  describe('concernant la page courante', () => {
    const laPageCourante = async () => pageCourante;

    it('sait extraire la page courante de service', async () => {
      const routeurStore = await leRouteur();
      const pageCourante = await laPageCourante();
      chargeInformationsService(routeurStore);
      routeurStore.navigue('/service/1234/mesures');

      const page = get(pageCourante);

      expect(page).toBe('mesures');
    });

    it('ne prend pas en compte les `queryParams`', async () => {
      const routeurStore = await leRouteur();
      const pageCourante = await laPageCourante();
      chargeInformationsService(routeurStore);
      routeurStore.navigue(
        '/service/1234/indiceCyber?onglet=indice-cyber-anssi'
      );

      const page = get(pageCourante);

      expect(page).toBe('indiceCyber');
    });

    it('sait gérer une route avec des sous-routes', async () => {
      const routeurStore = await leRouteur();
      const pageCourante = await laPageCourante();
      chargeInformationsService(routeurStore);
      routeurStore.navigue('/service/1234/homologation/edition/etape/avis');

      const page = get(pageCourante);

      expect(page).toBe('homologation');
    });
  });
});
