import { unUUID } from '../../constructeurs/UUID.ts';
import EvenementSimulationMigrationReferentielCreee from '../../../src/modeles/journalMSS/evenementSimulationMigrationReferentielCreee.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';

describe('Un événement de création de simulation de migration de référentiel', () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementSimulationMigrationReferentielCreee(
      {
        idService: unUUID('a'),
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idService).toBe(unUUID('A'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementSimulationMigrationReferentielCreee(
      {
        idService: unUUID('a'),
      },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      date: '27/03/2023',
      donnees: {
        idService: unUUID('A'),
      },
      type: 'SIMULATION_MIGRATION_REFERENTIEL_CREEE',
    });
  });

  it("exige que l'identifiant du service soit renseigné", () => {
    expect(
      () =>
        new EvenementSimulationMigrationReferentielCreee({
          // @ts-expect-error On force volontairement une valeur nulle pour provoquer l'erreur
          idService: undefined,
        })
    ).toThrow(ErreurDonneeManquante);
  });
});
