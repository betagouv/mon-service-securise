import { consigneDansJournal } from '../../../src/bus/abonnements/consigneDansJournal.ts';
import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';

describe("La fabrique d'abonnement qui consigne dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  const unEvenementJournal = (type: string) => ({
    toJSON: () => ({ type, donnees: {}, date: '17/11/2022' }),
  });

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it("consigne dans le journal l'événement de bus converti en événement de journal", async () => {
    const consigne = consigneDansJournal(
      ({ idService }: { idService: string }) =>
        unEvenementJournal(`SERVICE_${idService}`)
    );

    await consigne({ adaptateurJournal })({ idService: 'S1' });

    expect(adaptateurJournal.dernierEvenementConsigne()).toEqual({
      type: 'SERVICE_S1',
      donnees: {},
      date: '17/11/2022',
    });
  });

  it('transmet ses dépendances à la conversion', async () => {
    const consigne = consigneDansJournal(
      (_: object, { referentiel }: { referentiel: { nom: () => string } }) =>
        unEvenementJournal(referentiel.nom())
    );

    await consigne({ adaptateurJournal, referentiel: { nom: () => 'REF' } })(
      {}
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe('REF');
  });

  it("ne consigne rien et propage l'erreur si la conversion échoue", async () => {
    const consigne = consigneDansJournal(() => {
      throw new Error('Conversion impossible');
    });

    await expect(consigne({ adaptateurJournal })({})).rejects.toThrow(
      'Conversion impossible'
    );
    expect(adaptateurJournal.evenementsConsignes()).toEqual([]);
  });
});
