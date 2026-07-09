import MaintenanceService from '../../../src/modeles/partiesPrenantes/maintenanceService.js';

describe('Une maintenance du service', () => {
  it('sait se décrire en JSON', () => {
    const maintenanceService = new MaintenanceService({ nom: 'mainteneur' });
    expect(maintenanceService.toJSON()).toEqual({
      type: 'MaintenanceService',
      nom: 'mainteneur',
    });
  });
});
