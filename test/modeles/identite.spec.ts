const expect = require('expect.js');
const { Identite } = require('../../src/modeles/identite');

describe('Une identité', () => {
  describe('sur demande de ses initiales', () => {
    it('renvoie les initiales du prénom et du nom', () => {
      const jean = new Identite({
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
      });
      expect(jean.initiales()).to.equal('JD');
    });

    it('reste robuste en cas de prénom ou de nom absent', () => {
      const jean = new Identite({ email: 'jean.dupont@mail.fr' });
      expect(jean.initiales()).to.equal('');
    });
  });

  describe('sur demande du « prénom / nom »', () => {
    it('reste robuste si le nom est absent', () => {
      const jean = new Identite({
        prenom: 'Jean',
        email: 'jean.dupont@mail.fr',
      });
      expect(jean.prenomNom()).to.equal('Jean');
    });

    it('reste robuste si le prénom est absent', () => {
      const jean = new Identite({
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
      });
      expect(jean.prenomNom()).to.equal('Dupont');
    });

    it("retourne l'email si le prénom et le nom sont absents", () => {
      const jean = new Identite({ email: 'jean.dupont@mail.fr' });
      expect(jean.prenomNom()).to.equal('jean.dupont@mail.fr');
    });
  });

  it('combine toutes les informations de postes sur demande de son poste détaillé', () => {
    const plusieursPostes = new Identite({
      email: 'jean.dupont@mail.fr',
      postes: ['RSSI', 'DPO', 'Maire'],
    });

    expect(plusieursPostes.posteDetaille()).to.eql('RSSI, DPO et Maire');
  });
});
