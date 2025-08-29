import expect from 'expect.js';
import ActeursHomologation from '../../src/modeles/acteursHomologation.js';

const ils = it;

describe("Les acteurs de l'homologation", () => {
  ils('savent se dénombrer', () => {
    const acteursHomologation = new ActeursHomologation({
      acteursHomologation: [
        { role: 'DSI', nom: 'John', fonction: 'Directeur' },
        { role: 'Responsable du service', nom: 'Joe', fonction: 'Maire' },
      ],
    });
    expect(acteursHomologation.nombre()).to.equal(2);
  });

  ils("donnent la liste des propriétés de l'acteur", () => {
    expect(ActeursHomologation.proprietesItem()).to.eql([
      'role',
      'nom',
      'fonction',
    ]);
  });
});
