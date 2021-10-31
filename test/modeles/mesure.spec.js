const expect = require('expect.js');

const Mesure = require('../../src/modeles/mesure');

const elle = it;

describe('Une mesure', () => {
  elle('connaît ses statuts possibles', () => {
    expect(Mesure.statutsPossibles()).to.eql(['fait', 'planifie', 'nonFait', 'nonRetenu']);
  });
});
