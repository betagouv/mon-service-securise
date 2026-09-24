import EvenementNouveauServiceCree from '../../../src/modeles/journalMSS/evenementNouveauServiceCree.ts';
import { VersionService } from '../../../src/modeles/versionService.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de nouveau service créé', () => {
  it("consigne les identifiants hachés du service et de l'utilisateur, et la version du service", () => {
    const evenement = new EvenementNouveauServiceCree(
      {
        idService: unUUID('a'),
        idUtilisateur: unUUID('b'),
        versionService: VersionService.v1,
      },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'NOUVEAU_SERVICE_CREE',
      donnees: {
        idService: unUUID('A'),
        idUtilisateur: unUUID('B'),
        versionService: 'v1',
      },
      date: '17/11/2022',
    });
  });
});
