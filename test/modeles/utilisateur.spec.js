const expect = require('expect.js');

const Utilisateur = require('../../src/modeles/utilisateur');

describe('Un utilisateur', () => {
  it('sait se convertir en JSON', () => {
    const utilisateur = new Utilisateur({
      id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
    });

    expect(utilisateur.toJSON()).to.eql({ prenomNom: 'Jean Dupont' });
  });

  it('sait générer son JWT', (done) => {
    const adaptateurJWT = {};
    const utilisateur = new Utilisateur({
      id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
    }, adaptateurJWT);

    adaptateurJWT.genereToken = (idUtilisateur, callback) => {
      expect(idUtilisateur).to.equal('123');

      let aucuneErreur;
      callback(aucuneErreur, 'un jeton');
    };

    utilisateur.genereToken((erreur, token) => {
      if (erreur) done(erreur);
      expect(token).to.equal('un jeton');

      done();
    });
  });
});
