import EvenementNouvelleHomologationCreee from '../../../src/modeles/journalMSS/evenementNouvelleHomologationCreee.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de nouvelle homologation', () => {
  it("consigne l'identifiant haché du service, la date et la durée d'homologation", () => {
    const evenement = new EvenementNouvelleHomologationCreee(
      {
        idService: unUUID('a'),
        dateHomologation: '25/03/2023',
        dureeHomologationMois: 24,
      },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'NOUVELLE_HOMOLOGATION_CREEE',
      donnees: {
        idService: unUUID('A'),
        dateHomologation: '25/03/2023',
        dureeHomologationMois: 24,
      },
      date: '27/03/2023',
    });
  });

  it("exige la durée d'homologation si l'homologation n'est pas refusée", () => {
    expect(
      () =>
        new EvenementNouvelleHomologationCreee(
          { idService: unUUID('a'), dateHomologation: '2023-03-30' },
          { adaptateurChiffrement: hacheEnMajuscules }
        )
    ).toThrow(new ErreurDonneeManquante('dureeHomologationMois'));
  });

  it("accepte l'absence de durée d'homologation si l'homologation est refusée, et le consigne", () => {
    const evenement = new EvenementNouvelleHomologationCreee(
      { idService: unUUID('a'), dateHomologation: '2023-03-30', refusee: true },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.refusee).toBe(true);
    expect(evenement.donnees.dureeHomologationMois).toBeUndefined();
  });

  it("consigne le caractère importé de l'homologation", () => {
    const evenement = new EvenementNouvelleHomologationCreee(
      {
        idService: unUUID('a'),
        dateHomologation: '25/03/2023',
        dureeHomologationMois: 24,
        importe: true,
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.importe).toBe(true);
  });
});
