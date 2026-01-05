import ParcoursUtilisateur from '../../src/modeles/parcoursUtilisateur.ts';
import * as Referentiel from '../../src/referentiel.js';
import EtatVisiteGuidee from '../../src/modeles/etatVisiteGuidee.js';
import { creeReferentielVide } from '../../src/referentiel.js';
import { unUUID } from '../constructeurs/UUID.ts';

const donneesParcoursUtilisateur = () => ({
  idUtilisateur: unUUID('1'),
  dateDerniereConnexion: '2023-01-01',
  etatVisiteGuidee: { dejaTerminee: false, enPause: true },
  explicationNouveauReferentiel: {
    dejaTermine: false,
    aVuTableauDeBordDepuisConnexion: false,
  },
});

describe('Un parcours utilisateur', () => {
  it('sait se convertir en JSON', () => {
    const unParcours = new ParcoursUtilisateur(donneesParcoursUtilisateur());

    expect(unParcours.toJSON()).toEqual({
      idUtilisateur: unUUID('1'),
      dateDerniereConnexion: '2023-01-01',
      etatVisiteGuidee: { dejaTerminee: false, enPause: true },
      explicationNouveauReferentiel: {
        dejaTermine: false,
        aVuTableauDeBordDepuisConnexion: false,
      },
    });
  });

  it('sait se créer pour un utilisateur avec des valeurs par défaut', () => {
    const etatInitial = ParcoursUtilisateur.pourUtilisateur(
      unUUID('1'),
      creeReferentielVide()
    );

    expect(etatInitial.dateDerniereConnexion).toBe(undefined);
    expect(etatInitial.idUtilisateur).toEqual(unUUID('1'));
    expect(etatInitial.etatVisiteGuidee).toBeInstanceOf(EtatVisiteGuidee);
    expect(etatInitial.etatVisiteGuidee.dejaTerminee).toBe(false);
    expect(etatInitial.etatVisiteGuidee.enPause).toBe(false);
    expect(etatInitial.explicationNouveauReferentiel.estTermine()).toBe(false);
    expect(
      etatInitial.explicationNouveauReferentiel.aVuTableauDeBordDepuisConnexion
    ).toBe(false);
  });

  it("sait enregistrer une date de dernière connexion en utilisant l'adaptateur horloge", () => {
    const dateDeConnexion = new Date();
    const adaptateurHorloge = { maintenant: () => dateDeConnexion };
    const unParcours = new ParcoursUtilisateur(
      donneesParcoursUtilisateur(),
      Referentiel.creeReferentielVide(),
      adaptateurHorloge
    );

    unParcours.enregistreDerniereConnexionMaintenant();

    const dateParcours = unParcours.toJSON().dateDerniereConnexion;
    expect(dateParcours).toEqual(dateDeConnexion.toISOString());
  });
});
