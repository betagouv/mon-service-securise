const expect = require('expect.js');

const DepotDonnees = require('../src/depotDonnees');

describe('Le dépôt de données', () => {
  describe('quand il est vide', () => {
    it('ne retourne aucune homologation', () => {
      const depot = DepotDonnees.creeDepotVide();
      expect(depot.homologations('456')).to.eql([]);
    });
  });

  it("connaît toutes les homologations d'un utilisateur donné", () => {
    const depot = DepotDonnees.creeDepot({
      homologations: [
        { id: '123', idUtilisateur: '456', nomService: 'Super Service' },
        { id: '789', idUtilisateur: '999', nomService: 'Un autre service' },
      ],
    });

    const homologations = depot.homologations('456');
    expect(homologations.length).to.equal(1);
    expect(homologations[0].id).to.equal('123');
  });
});
