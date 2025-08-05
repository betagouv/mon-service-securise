import { describe, expect, it } from 'vitest';
import { mesuresAvecServicesAssociesStore } from '../../lib/listeMesures/servicesAssocies/mesuresAvecServicesAssocies.store';
import { servicesAvecMesuresAssociees } from '../../lib/listeMesures/servicesAssocies/servicesAvecMesuresAssociees.store';
import { get } from 'svelte/store';
import type { ServiceAvecMesuresAssociees } from '../../lib/listeMesures/listeMesures.d';

const unService = (
  id: string = 'S1',
  nomService: string = 'ServiceS1',
  mesuresAssociees: Record<string, any> = { M1: {} }
): ServiceAvecMesuresAssociees => ({
  id,
  nomService,
  organisationResponsable: 'SuperEntreprise',
  mesuresAssociees,
  mesuresSpecifiques: [],
  peutEtreModifie: true,
  niveauSecurite: 'niveau1',
  typeService: ['api'],
});

describe('Le store des mesures avec services associés', () => {
  it('construis le résultat pour une mesure et un service', () => {
    servicesAvecMesuresAssociees.set([unService()]);

    expect(get(mesuresAvecServicesAssociesStore)).toStrictEqual({
      M1: ['S1'],
    });
  });

  it('agrège pour plusieurs services', () => {
    servicesAvecMesuresAssociees.set([
      unService(),
      unService('S2', 'ServiceS2'),
    ]);

    expect(get(mesuresAvecServicesAssociesStore)).toStrictEqual({
      M1: ['S1', 'S2'],
    });
  });

  it('agrège pour plusieurs mesures', () => {
    servicesAvecMesuresAssociees.set([
      unService('S1', 'ServiceS1', { M1: {}, M2: {} }),
      unService('S2', 'ServiceS2', { M3: {} }),
    ]);

    expect(get(mesuresAvecServicesAssociesStore)).toStrictEqual({
      M1: ['S1'],
      M2: ['S1'],
      M3: ['S2'],
    });
  });
});
