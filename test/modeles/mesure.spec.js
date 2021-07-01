const expect = require('expect.js');

const Mesure = require('../../src/modeles/mesure');

describe('Une mesure de sécurité', () => {
  it('sait se décrire', () => {
    const mesure = new Mesure({
      id: 'identifiantMesure',
      statut: Mesure.STATUT_FAIT,
      modalites: "Des modalités d'application",
    });

    expect(mesure.id).to.equal('identifiantMesure');
    expect(mesure.statut).to.equal(Mesure.STATUT_FAIT);
    expect(mesure.modalites).to.equal("Des modalités d'application");
  });
});
