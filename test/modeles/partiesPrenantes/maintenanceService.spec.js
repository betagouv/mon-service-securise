import expect from 'expect.js';
import MaintenanceService from '../../../src/modeles/partiesPrenantes/maintenanceService.js';

describe('Une maintenance du service', () => {
  it('sait se décrire en JSON', () => {
    const maintenanceService = new MaintenanceService({ nom: 'mainteneur' });
    expect(maintenanceService.toJSON()).to.eql({
      type: 'MaintenanceService',
      nom: 'mainteneur',
    });
  });
});
