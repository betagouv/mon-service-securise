const expect = require('expect.js');
const { Contributeur } = require('../../src/modeles/contributeur');

describe('Un contributeur', () => {
  it("connaît l'identifiant de l'utilisateur qu'il représente", () => {
    const contributeur = new Contributeur({ id: 'C-1' });

    expect(contributeur.idUtilisateur).to.be('C-1');
  });

  it('connaît son « prénom / nom »', () => {
    const contributeur = new Contributeur({ prenom: 'Jean', nom: 'Dujardin' });

    expect(contributeur.prenomNom()).to.be('Jean Dujardin');
  });

  it('connaît ses initiales', () => {
    const contributeur = new Contributeur({ prenom: 'Jean', nom: 'Dujardin' });

    expect(contributeur.initiales()).to.be('JD');
  });

  it("connaît les détails du poste qu'il occupe", () => {
    const contributeur = new Contributeur({
      postes: ['RSSI', 'DPO', 'Maire'],
    });

    expect(contributeur.posteDetaille()).to.eql('RSSI, DPO et Maire');
  });
});
