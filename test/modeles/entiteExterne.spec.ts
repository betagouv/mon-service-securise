const expect = require('expect.js');

const EntiteExterne = require('../../src/modeles/entiteExterne');

describe('Une entité externe', () => {
  it('connaît ses constituants', () => {
    const entite = new EntiteExterne({
      nom: 'Un nom',
      contact: 'jean.dupont@mail.fr',
      acces: 'Accès administrateur',
    });

    expect(entite.nom).to.equal('Un nom');
    expect(entite.contact).to.equal('jean.dupont@mail.fr');
    expect(entite.acces).to.equal('Accès administrateur');
  });

  it('a pour statut de saisie COMPLETES si le nom et le contact sont renseignés', () => {
    const entite = new EntiteExterne({
      nom: 'Un nom',
      contact: 'jean.dupont@mail.fr',
    });

    expect(entite.statutSaisie()).to.equal(EntiteExterne.COMPLETES);
  });

  it('a pour statut de saisie A_COMPLETER si le nom ou le contact ne sont pas renseignés', () => {
    const entite = new EntiteExterne({
      nom: 'Un nom',
      acces: 'Accès administrateur',
    });

    expect(entite.statutSaisie()).to.equal(EntiteExterne.A_COMPLETER);
  });
});
