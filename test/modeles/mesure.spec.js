const expect = require('expect.js');

const Mesure = require('../../src/modeles/mesure');

const elle = it;

describe('Une mesure', () => {
  elle('connaît ses statuts possibles', () => {
    expect(Mesure.statutsPossibles()).to.eql(['fait', 'planifie', 'nonFait', 'nonRetenu']);
  });

  elle("ne tient pas compte du statut s'il n'est pas renseigné", (done) => {
    try {
      Mesure.valide({ statut: undefined });
      done();
    } catch {
      done("La validation de la mesure sans statut n'aurait pas dû lever d'exception.");
    }
  });
});
