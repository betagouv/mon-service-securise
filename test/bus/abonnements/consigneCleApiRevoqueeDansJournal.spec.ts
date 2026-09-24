import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneCleApiRevoqueeDansJournal } from '../../../src/bus/abonnements/consigneCleApiRevoqueeDansJournal.ts';
import { EvenementCleApiRevoquee } from '../../../src/bus/evenementCleApiRevoquee.ts';
import { CleApi } from '../../../src/modeles/cleApi.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne une clé d'API révoquée dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de clé révoquée', async () => {
    const { cle } = CleApi.nouvelle(unUUID('U'), 30, (valeur) => valeur);
    const dateRevocation = new Date('2026-09-15T10:00:00Z');
    cle.revoque(dateRevocation);

    await consigneCleApiRevoqueeDansJournal({ adaptateurJournal })(
      new EvenementCleApiRevoquee({ cle })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toEqual(
      'CLE_API_REVOQUEE'
    );
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(adaptateurJournal.dernierEvenementConsigne().donnees).toEqual({
      idCle: hache(cle.donnees().id),
      idUtilisateur: hache(unUUID('U')),
      dateRevocation,
    });
  });
});
