import { describe, expect, it } from 'vitest';
import { mesuresAvecServicesAssociesStore } from '../../lib/listeMesures/stores/mesuresAvecServicesAssocies.store';
import { servicesAvecMesuresAssociees } from '../../lib/listeMesures/stores/servicesAvecMesuresAssociees.store';
import { get } from 'svelte/store';

describe('Le store des mesures avec services associés', () => {
  it('construis le résultat pour une mesure et un service', () => {
    servicesAvecMesuresAssociees.set([
      {
        id: 'S1',
        nomService: 'ServiceS1',
        organisationResponsable: 'SuperEntreprise',
        mesuresAssociees: {
          M1: {},
        },
        peutEtreModifie: true,
      },
    ]);

    expect(get(mesuresAvecServicesAssociesStore)).toStrictEqual({
      M1: ['S1'],
    });
  });

  it('agrège pour plusieurs services', () => {
    servicesAvecMesuresAssociees.set([
      {
        id: 'S1',
        nomService: 'ServiceS1',
        organisationResponsable: 'SuperEntreprise',
        mesuresAssociees: {
          M1: {},
        },
        peutEtreModifie: true,
      },
      {
        id: 'S2',
        nomService: 'ServiceS2',
        organisationResponsable: 'SuperEntreprise',
        mesuresAssociees: {
          M1: {},
        },
        peutEtreModifie: true,
      },
    ]);

    expect(get(mesuresAvecServicesAssociesStore)).toStrictEqual({
      M1: ['S1', 'S2'],
    });
  });

  it('agrège pour plusieurs mesures', () => {
    servicesAvecMesuresAssociees.set([
      {
        id: 'S1',
        nomService: 'ServiceS1',
        organisationResponsable: 'SuperEntreprise',
        mesuresAssociees: {
          M1: {},
          M2: {},
        },
        peutEtreModifie: true,
      },
      {
        id: 'S2',
        nomService: 'ServiceS2',
        organisationResponsable: 'SuperEntreprise',
        mesuresAssociees: {
          M3: {},
        },
        peutEtreModifie: true,
      },
    ]);

    expect(get(mesuresAvecServicesAssociesStore)).toStrictEqual({
      M1: ['S1'],
      M2: ['S1'],
      M3: ['S2'],
    });
  });
});
