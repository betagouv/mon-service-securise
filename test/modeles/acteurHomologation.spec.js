const expect = require('expect.js');

const ActeurHomologation = require('../../src/modeles/acteurHomologation');

describe("Un acteur de l'homologation", () => {
  const acteurHomologation = new ActeurHomologation({
    role: 'DSI',
    nom: 'John Doe',
    fonction: 'Maire',
  });

  it('connaît son rôle', () => {
    expect(acteurHomologation.role).to.equal('DSI');
  });

  it('connaît son nom', () => {
    expect(acteurHomologation.nom).to.equal('John Doe');
  });

  it('connaît sa fonction', () => {
    expect(acteurHomologation.fonction).to.equal('Maire');
  });

  it('donne les clés de ses propriétés', () => {
    expect(ActeurHomologation.proprietes()).to.eql(['role', 'nom', 'fonction']);
  });
});
