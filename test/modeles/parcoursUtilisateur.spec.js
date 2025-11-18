import expect from 'expect.js';
import ParcoursUtilisateur from '../../src/modeles/parcoursUtilisateur.js';
import * as Referentiel from '../../src/referentiel.js';
import EtatVisiteGuidee from '../../src/modeles/etatVisiteGuidee.js';

describe('Un parcours utilisateur', () => {
  it('sait se convertir en JSON', () => {
    const unParcours = new ParcoursUtilisateur({
      idUtilisateur: '456',
      dateDerniereConnexion: '2023-01-01',
      etatVisiteGuidee: { dejaTerminee: false, enPause: true },
      explicationNouveauReferentiel: { dejaTermine: false },
    });

    expect(unParcours.toJSON()).to.eql({
      idUtilisateur: '456',
      dateDerniereConnexion: '2023-01-01',
      etatVisiteGuidee: { dejaTerminee: false, enPause: true },
      explicationNouveauReferentiel: { dejaTermine: false },
    });
  });

  it('sait se créer pour un utilisateur avec des valeurs par défaut', () => {
    const etatInitial = ParcoursUtilisateur.pourUtilisateur('456');

    expect(etatInitial.dateDerniereConnexion).to.be(undefined);
    expect(etatInitial.idUtilisateur).to.equal('456');
    expect(etatInitial.etatVisiteGuidee).to.be.an(EtatVisiteGuidee);
    expect(etatInitial.etatVisiteGuidee.dejaTerminee).to.be(false);
    expect(etatInitial.etatVisiteGuidee.enPause).to.be(false);
    expect(etatInitial.explicationNouveauReferentiel.estTermine()).to.be(false);
  });

  it("sait enregistrer une date de dernière connexion en utilisant l'adaptateur horloge", () => {
    const dateDeConnexion = new Date();
    const adaptateurHorloge = { maintenant: () => dateDeConnexion };
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
