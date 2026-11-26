import ObjetPersistanceService from '../../../src/modeles/objetsPersistance/objetPersistanceService.js';

describe("Les données de persistance d'un service", () => {
  it('peuvent exclure une propriété', () => {
    const donneesService = {
      id: 'id',
      dossiers: [{ id: '999', finalise: false }],
    };

    expect(
      new ObjetPersistanceService(donneesService).sauf('dossiers')
    ).toEqual({ id: 'id' });
  });

  it('peuvent exclure plusieurs propriétés', () => {
    const donneesService = {
      id: 'id',
      dossiers: [{ id: '999', finalise: false }],
    };

    expect(
      new ObjetPersistanceService(donneesService).sauf('dossiers', 'id')
    ).toEqual({});
  });
});
