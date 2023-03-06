const expect = require('expect.js');

const { confectionne } = require('../../../src/pdf/latex/fabriquantGabarit');

describe('Le fabriquant avec gabarit', () => {
  it("confectionne à partir d'un gabarit et de données", () => {
    const texteGabarit = '__= donnees.titre __ __= donnees.numero __';
    expect(confectionne(texteGabarit, { titre: 'Le titre', numero: 1 })).to.equal('Le titre 1');
  });
});
