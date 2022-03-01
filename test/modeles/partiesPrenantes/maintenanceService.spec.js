const expect = require('expect.js');

const MaintenanceService = require('../../../src/modeles/partiesPrenantes/maintenanceService');

describe('Une maintenance du service', () => {
  it('sait se décrire en JSON', () => {
    const maintenanceService = new MaintenanceService({ nom: 'mainteneur' });
    expect(maintenanceService.toJSON()).to.eql({ type: 'MaintenanceService', nom: 'mainteneur' });
  });
});
