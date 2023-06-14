const expect = require('expect.js');

const ParcoursUtilisateur = require('../../src/modeles/parcoursUtilisateur');

describe('Un parcours utilisateur', () => {
  it('sait se convertir en JSON', () => {
    const unParcours = new ParcoursUtilisateur({
      id: '123',
      idUtilisateur: '456',
      dateDerniereConnexion: '2023-01-01',
    });

    expect(unParcours.toJSON()).to.eql({
      id: '123',
      idUtilisateur: '456',
      dateDerniereConnexion: '2023-01-01',
    });
  });

  it("sait enregistrer une date de dernière connexion en utilisant l'adaptateur horloge", () => {
    const dateDeConnexion = new Date();
    const adaptateurHorloge = {
      maintenant: () => dateDeConnexion,
    };
    const unParcours = new ParcoursUtilisateur(
      {
        id: '123',
        idUtilisateur: '456',
        dateDerniereConnexion: '2023-01-01',
      },
      adaptateurHorloge
    );

    unParcours.enregistreDerniereConnexionMaintenant();
    expect(unParcours.toJSON().dateDerniereConnexion).to.equal(
      dateDeConnexion.toISOString()
    );
  });
});
