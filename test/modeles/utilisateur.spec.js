const expect = require('expect.js');

const { ErreurEmailManquant } = require('../../src/erreurs');
const Utilisateur = require('../../src/modeles/utilisateur');

describe('Un utilisateur', () => {
  describe('sur demande de ses initiales', () => {
    it('renvoie les initiales du prénom et du nom', () => {
      const utilisateur = new Utilisateur({ prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' });
      expect(utilisateur.initiales()).to.equal('JD');
    });

    it('reste robuste en cas de prénom ou de nom absent', () => {
      const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
      expect(utilisateur.initiales()).to.equal('');
    });
  });

  it('sait se convertir en JSON', () => {
    const utilisateur = new Utilisateur({
      id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
    });

    expect(utilisateur.toJSON()).to.eql({ prenomNom: 'Jean Dupont', initiales: 'JD' });
  });

  it('sait générer son JWT', (done) => {
    const adaptateurJWT = {};
    const utilisateur = new Utilisateur({
      id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', cguAcceptees: false,
    }, adaptateurJWT);

    adaptateurJWT.genereToken = (idUtilisateur, cguAcceptees, callback) => {
      expect(idUtilisateur).to.equal('123');
      expect(cguAcceptees).to.be(false);

      let aucuneErreur;
      callback(aucuneErreur, 'un jeton');
    };

    utilisateur.genereToken((erreur, token) => {
      if (erreur) done(erreur);
      expect(token).to.equal('un jeton');

      done();
    });
  });

  it('sait détecter si les conditions générales ont été acceptées', () => {
    const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr', cguAcceptees: true });
    expect(utilisateur.accepteCGU()).to.be(true);

    const autreUtilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
    expect(autreUtilisateur.accepteCGU()).to.be(false);
  });

  it("exige que l'adresse électronique soit renseignée", (done) => {
    try {
      new Utilisateur({ prenom: 'Jean', nom: 'Dupont' });
      done("La création de l'utilisateur aurait dû lever une ErreurEmailManquant");
    } catch (e) {
      expect(e).to.be.a(ErreurEmailManquant);
      done();
    }
  });
});
