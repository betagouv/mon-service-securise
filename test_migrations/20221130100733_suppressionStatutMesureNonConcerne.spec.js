const expect = require('expect.js');
const { nouveauStatut } = require('../migrations/20221130100733_suppressionStatutMesureNonConcerne');

const Statuts = {
  FAIT: 'fait',
  NON_FAIT: 'nonFait',
  NON_CONCERNE: 'nonRetenu',
};

describe('Le nouveau statut', () => {
  it("reste le même quand le statut n'est pas non concerné", () => {
    expect(nouveauStatut(Statuts.FAIT)).to.equal(Statuts.FAIT);
    expect(nouveauStatut(Statuts.NON_FAIT)).to.equal(Statuts.NON_FAIT);
  });

  it('devient non fait quand le statut est non concerné', () => {
    expect(nouveauStatut(Statuts.NON_CONCERNE)).to.equal(Statuts.NON_FAIT);
  });

  it("reste robuste quand le statut est n'est pas défini", () => {
    expect(nouveauStatut()).to.equal(undefined);
  });
});
