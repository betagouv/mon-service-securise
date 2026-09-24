import EvenementConnexionUtilisateur from '../../../src/modeles/journalMSS/evenementConnexionUtilisateur.ts';
import { ErreurDateDerniereConnexionInvalide } from '../../../src/modeles/journalMSS/erreurs.ts';
import { SourceAuthentification } from '../../../src/modeles/sourceAuthentification.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de connexion utilisateur', () => {
  const uneConnexion = (dateDerniereConnexion = '2022-07-07') => ({
    idUtilisateur: unUUID('a'),
    dateDerniereConnexion,
    source: SourceAuthentification.AGENT_CONNECT,
    connexionAvecMFA: false,
  });

  it("consigne l'identifiant haché de l'utilisateur et les modalités de connexion", () => {
    const evenement = new EvenementConnexionUtilisateur(uneConnexion(), {
      date: '17/11/2022',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).toEqual({
      type: 'CONNEXION_UTILISATEUR',
      donnees: {
        idUtilisateur: unUUID('A'),
        dateDerniereConnexion: '2022-07-07',
        source: SourceAuthentification.AGENT_CONNECT,
        connexionAvecMFA: false,
      },
      date: '17/11/2022',
    });
  });

  it('exige que la date de dernière connexion soit valide', () => {
    expect(
      () =>
        new EvenementConnexionUtilisateur(uneConnexion('pasValide'), {
          adaptateurChiffrement: hacheEnMajuscules,
        })
    ).toThrow(ErreurDateDerniereConnexionInvalide);
  });
});
