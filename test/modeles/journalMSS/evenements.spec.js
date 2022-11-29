const expect = require('expect.js');
const { EvenementNouveauServiceCree } = require('../../../src/modeles/journalMSS/evenements');

describe('Un événement de nouveau service créé', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur.toUpperCase() };

  it("chiffre l'identifiant utilisateur qui lui est donné", () => {
    const evenement = new EvenementNouveauServiceCree(
      { idUtilisateur: 'abc' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouveauServiceCree(
      { idUtilisateur: 'abc' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'NOUVEAU_SERVICE_CREE',
      donnees: { idUtilisateur: 'ABC' },
      date: '17/11/2022',
    });
  });
});
