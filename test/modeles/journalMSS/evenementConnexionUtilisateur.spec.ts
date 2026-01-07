import EvenementConnexionUtilisateur from '../../../src/modeles/journalMSS/evenementConnexionUtilisateur.js';
import {
  ErreurDateDerniereConnexionInvalide,
  ErreurDonneeManquante,
} from '../../../src/modeles/journalMSS/erreurs.js';
import { unUUID } from '../../constructeurs/UUID.ts';
import { SourceAuthentification } from '../../../src/modeles/sourceAuthentification.ts';

describe('Un événement de connexion utilisateur', () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  const donneesEvenement = () => ({
    idUtilisateur: unUUID('a'),
    dateDerniereConnexion: '2022-07-07',
    source: SourceAuthentification.MSS,
    connexionAvecMFA: false,
  });

  it("hache l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementConnexionUtilisateur(donneesEvenement(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON().donnees.idUtilisateur).toBe(unUUID('A'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementConnexionUtilisateur(donneesEvenement(), {
      date: '17/11/2022',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).to.eql({
      type: 'CONNEXION_UTILISATEUR',
      donnees: {
        idUtilisateur: unUUID('A'),
        dateDerniereConnexion: '2022-07-07',
        source: SourceAuthentification.MSS,
        connexionAvecMFA: false,
      },
      date: '17/11/2022',
    });
  });

  it("exige que l'identifiant utilisateur soit renseigné", () => {
    expect(
      () =>
        new EvenementConnexionUtilisateur(
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          { ...donneesEvenement(), idUtilisateur: null },
          { adaptateurChiffrement: hacheEnMajuscules }
        )
    ).toThrowError(ErreurDonneeManquante);
  });

  it('exige que la date de dernière connexion soit renseignée', () => {
    expect(
      () =>
        new EvenementConnexionUtilisateur(
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          { ...donneesEvenement(), dateDerniereConnexion: null },
          { adaptateurChiffrement: hacheEnMajuscules }
        )
    ).toThrowError(ErreurDonneeManquante);
  });

  it('exige que la date de dernière connexion soit valide', () => {
    expect(
      () =>
        new EvenementConnexionUtilisateur(
          { ...donneesEvenement(), dateDerniereConnexion: 'pasValide' },
          { adaptateurChiffrement: hacheEnMajuscules }
        )
    ).toThrowError(ErreurDateDerniereConnexionInvalide);
  });

  it('exige que la source soit renseignée', () => {
    expect(
      () =>
        new EvenementConnexionUtilisateur(
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          { ...donneesEvenement(), source: null },
          { adaptateurChiffrement: hacheEnMajuscules }
        )
    ).toThrowError(ErreurDonneeManquante);
  });

  it('exige que la connexion avec MFA soit renseignée', () => {
    expect(
      () =>
        new EvenementConnexionUtilisateur(
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          { ...donneesEvenement(), connexionAvecMFA: null },
          { adaptateurChiffrement: hacheEnMajuscules }
        )
    ).toThrowError(ErreurDonneeManquante);
  });
});
