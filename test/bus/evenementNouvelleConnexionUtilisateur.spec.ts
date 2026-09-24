import EvenementNouvelleConnexionUtilisateur from '../../src/bus/evenementNouvelleConnexionUtilisateur.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.ts';

describe("L'événement `EvenementNouvelleConnexionUtilisateur`", () => {
  it("lève une exception s'il est instancié avec une date de dernière connexion qui n'est pas une date", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateur: unUUID('1'),
          dateDerniereConnexion: 'pasUneDate',
          source: SourceAuthentification.AGENT_CONNECT,
          connexionAvecMFA: false,
        })
    ).toThrowError();
  });
});
