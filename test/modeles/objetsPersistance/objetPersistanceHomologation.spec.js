const expect = require('expect.js');
const ObjetPersistanceHomologation = require('../../../src/modeles/objetsPersistance/objetPersistanceHomologation');

describe("Les données de persistance d'une homologation", () => {
  it('peuvent exclure une propriété', () => {
    const donneesHomologation = {
      id: 'id',
      dossiers: [{ id: '999', finalise: false }],
    };

    expect(
      new ObjetPersistanceHomologation(donneesHomologation).sauf('dossiers')
    ).to.eql({ id: 'id' });
  });

  it('peuvent exclure plusieurs propriétés', () => {
    const donneesHomologation = {
      id: 'id',
      dossiers: [{ id: '999', finalise: false }],
    };

    expect(
      new ObjetPersistanceHomologation(donneesHomologation).sauf(
        'dossiers',
        'id'
      )
    ).to.eql({});
  });
});
