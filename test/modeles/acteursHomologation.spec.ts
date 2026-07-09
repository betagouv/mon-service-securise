import ActeursHomologation from '../../src/modeles/acteursHomologation.js';

describe("Les acteurs de l'homologation", () => {
  it('savent se dénombrer', () => {
    const acteursHomologation = new ActeursHomologation({
      acteursHomologation: [
        { role: 'DSI', nom: 'John', fonction: 'Directeur' },
        { role: 'Responsable du service', nom: 'Joe', fonction: 'Maire' },
      ],
    });
    expect(acteursHomologation.nombre()).toEqual(2);
  });

  it("donnent la liste des propriétés de l'acteur", () => {
    expect(ActeursHomologation.proprietesItem()).toEqual([
      'role',
      'nom',
      'fonction',
    ]);
  });
});
