import ActeurHomologation from '../../src/modeles/acteurHomologation.js';

describe("Un acteur de l'homologation", () => {
  const acteurHomologation = new ActeurHomologation({
    role: 'DSI',
    nom: 'John Doe',
    fonction: 'Maire',
  });

  it('connaît son rôle', () => {
    expect(acteurHomologation.role).toEqual('DSI');
  });

  it('connaît son nom', () => {
    expect(acteurHomologation.nom).toEqual('John Doe');
  });

  it('connaît sa fonction', () => {
    expect(acteurHomologation.fonction).toEqual('Maire');
  });

  it('donne les clés de ses propriétés', () => {
    expect(ActeurHomologation.proprietes()).toEqual([
      'role',
      'nom',
      'fonction',
    ]);
  });
});
