import EvenementNouvelleConnexionUtilisateur from '../../src/bus/evenementNouvelleConnexionUtilisateur.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.ts';

describe("L'événement `EvenementNouvelleConnexionUtilisateur", () => {
  it("lève une exception s'il est instancié sans id utilisateur", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          idUtilisateur: null,
          dateDerniereConnexion: '2024-03-25',
          source: SourceAuthentification.MSS,
        })
    ).toThrowError();
  });

  it("lève une exception s'il est instancié sans date de dernière connexion", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateur: unUUID('1'),
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          dateDerniereConnexion: null,
          source: SourceAuthentification.MSS,
        })
    ).toThrowError();
  });

  it("lève une exception s'il est instancié avec une date de dernière connexion qui n'est pas une date", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateur: unUUID('1'),
          dateDerniereConnexion: 'pasUneDate',
          source: SourceAuthentification.MSS,
        })
    ).toThrowError();
  });

  it("lève une exception s'il est instancié sans source", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateur: unUUID('1'),
          dateDerniereConnexion: '2024-01-01',
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          source: null,
        })
    ).toThrowError();
  });
});
