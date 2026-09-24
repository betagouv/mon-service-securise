import EvenementServicesImportes from '../../../src/modeles/journalMSS/evenementServicesImportes.ts';
import { VersionService } from '../../../src/modeles/versionService.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de services importés', () => {
  it("consigne l'identifiant haché de l'utilisateur, le nombre et la version des services importés", () => {
    const evenement = new EvenementServicesImportes(
      {
        idUtilisateur: unUUID('a'),
        nbServicesImportes: 42,
        versionServicesImportes: VersionService.v2,
      },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'SERVICES_IMPORTES',
      donnees: {
        idUtilisateur: unUUID('A'),
        nbServicesImportes: 42,
        versionServicesImportes: 'v2',
      },
      date: '27/03/2023',
    });
  });
});
