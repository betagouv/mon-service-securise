import EvenementServicesImportes from '../../../src/modeles/journalMSS/evenementServicesImportes.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { VersionService } from '../../../src/modeles/versionService.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';

describe('Un événement de services importés', () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  it("chiffre l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementServicesImportes(
      {
        idUtilisateur: unUUID('a'),
        nbServicesImportes: 42,
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idUtilisateur).toBe(unUUID('A'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementServicesImportes(
      {
        idUtilisateur: unUUID('a'),
        nbServicesImportes: 42,
        versionServicesImportes: VersionService.v2,
      },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'SERVICES_IMPORTES',
      donnees: {
        idUtilisateur: unUUID('A'),
        nbServicesImportes: 42,
        versionServicesImportes: 'v2',
      },
      date: '27/03/2023',
    });
  });

  const donneesSans = (propriete: 'idUtilisateur' | 'nbServicesImportes') => {
    const donnees = { idUtilisateur: unUUID('a'), nbServicesImportes: 0 };
    delete donnees[propriete];
    return donnees;
  };

  it("exige que l'identifiant de l'utilisateur soit renseigné", () => {
    expect(
      () => new EvenementServicesImportes(donneesSans('idUtilisateur'))
    ).toThrowError(ErreurDonneeManquante);
  });

  it('exige que le nombre de services importés soit renseignée', () => {
    expect(
      () => new EvenementServicesImportes(donneesSans('nbServicesImportes'))
    ).toThrowError(ErreurDonneeManquante);
  });
});
