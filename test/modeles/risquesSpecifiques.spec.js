import expect from 'expect.js';
import RisqueSpecifique from '../../src/modeles/risqueSpecifique.js';
import RisquesSpecifiques from '../../src/modeles/risquesSpecifiques.js';

describe('La liste des risques spécifiques', () => {
  it('sait se dénombrer', () => {
    const risques = new RisquesSpecifiques({ risquesSpecifiques: [] });
    expect(risques.nombre()).to.equal(0);
  });

  it('est composée de risques spécifiques', () => {
    const risques = new RisquesSpecifiques({
      risquesSpecifiques: [
        { description: 'Un risque spécifique', commentaire: 'Un commentaire' },
      ],
    });

    expect(risques.item(0)).to.be.a(RisqueSpecifique);
  });

  it("n'écrase jamais l'identifiant numérique sur mise à jour", () => {
    const listeRisques = new RisquesSpecifiques({
      risquesSpecifiques: [{ id: '1234', identifiantNumerique: 'RS2' }],
    });
    const risque = new RisqueSpecifique({
      id: '1234',
      identifiantNumerique: 'nouvelle',
    });

    listeRisques.metsAJourRisque(risque);

    expect(listeRisques.item(0).identifiantNumerique).to.be('RS2');
  });
});
