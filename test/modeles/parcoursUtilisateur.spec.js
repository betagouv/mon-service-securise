const expect = require('expect.js');

const ParcoursUtilisateur = require('../../src/modeles/parcoursUtilisateur');
const Referentiel = require('../../src/referentiel');
const EtatVisiteGuidee = require('../../src/modeles/etatVisiteGuidee');

describe('Un parcours utilisateur', () => {
  it('sait se convertir en JSON', () => {
    const unParcours = new ParcoursUtilisateur({
      idUtilisateur: '456',
      dateDerniereConnexion: '2023-01-01',
      etatVisiteGuidee: { dejaTerminee: false, enPause: true },
    });

    expect(unParcours.toJSON()).to.eql({
      idUtilisateur: '456',
      dateDerniereConnexion: '2023-01-01',
      etatVisiteGuidee: { dejaTerminee: false, enPause: true },
    });
  });

  it('sait se créer pour un utilisateur avec des valeurs par défaut', () => {
    const etatInitial = ParcoursUtilisateur.pourUtilisateur('456');

    expect(etatInitial.dateDerniereConnexion).to.be(undefined);
    expect(etatInitial.idUtilisateur).to.equal('456');
    expect(etatInitial.etatVisiteGuidee).to.be.an(EtatVisiteGuidee);
    expect(etatInitial.etatVisiteGuidee.dejaTerminee).to.be(false);
    expect(etatInitial.etatVisiteGuidee.enPause).to.be(false);
  });

  it("sait enregistrer une date de dernière connexion en utilisant l'adaptateur horloge", () => {
    const dateDeConnexion = new Date();
    const adaptateurHorloge = {
      maintenant: () => dateDeConnexion,
    };
    const unParcours = new ParcoursUtilisateur(
      {
        idUtilisateur: '456',
        dateDerniereConnexion: '2023-01-01',
      },
      Referentiel.creeReferentielVide(),
      adaptateurHorloge
    );

    unParcours.enregistreDerniereConnexionMaintenant();

    const dateParcours = unParcours.toJSON().dateDerniereConnexion;
    expect(dateParcours).to.equal(dateDeConnexion.toISOString());
  });
});
