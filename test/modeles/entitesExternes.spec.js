const expect = require('expect.js');

const EntitesExternes = require('../../src/modeles/entitesExternes');

const elles = it;

describe('Les entités externes', () => {
  elles('savent se dénombrer', () => {
    const entites = new EntitesExternes({ entitesExternes: [
      { nom: 'Une entité', acces: 'Un accès' },
      { nom: 'Une autre entité', acces: 'Un autre accès' },
    ] });

    expect(entites.nombre()).to.equal(2);
  });

  elles("ont comme statut A_COMPLETER si au moins l'une d'entre elle a ce statut", () => {
    const entites = new EntitesExternes({ entitesExternes: [
      { nom: 'Une entité', contact: 'Une adresse' },
      { nom: 'Une autre entité', contact: 'Une autre adresse' },
      { nom: 'Encore une entité' },
    ] });

    expect(entites.statutSaisie()).to.equal(EntitesExternes.A_COMPLETER);
  });

  elles('ont comme statut COMPLETES quand chacune a ce statut', () => {
    const entites = new EntitesExternes({ entitesExternes: [
      { nom: 'Une entité', contact: 'Une adresse' },
      { nom: 'Une autre entité', contact: 'Une autre adresse' },
    ] });

    expect(entites.statutSaisie()).to.equal(EntitesExternes.COMPLETES);
  });

  elles("ont comme statut A_SAISIR si aucune entité n'est déclarée", () => {
    const entites = new EntitesExternes({ entitesExternes: [] });

    expect(entites.statutSaisie()).to.equal(EntitesExternes.A_SAISIR);
  });
});
