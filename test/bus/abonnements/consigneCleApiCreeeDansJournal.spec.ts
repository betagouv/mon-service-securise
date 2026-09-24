import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneCleApiCreeeDansJournal } from '../../../src/bus/abonnements/consigneCleApiCreeeDansJournal.ts';
import { EvenementCleApiCreee } from '../../../src/bus/evenementCleApiCreee.ts';
import { CleApi } from '../../../src/modeles/cleApi.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne une clé d'API créée dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de clé créée', async () => {
    const { cle } = CleApi.nouvelle(unUUID('U'), 30, (valeur) => valeur);

    await consigneCleApiCreeeDansJournal({ adaptateurJournal })(
      new EvenementCleApiCreee({ cle, dureeValiditeEnJours: 30 })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toEqual(
      'CLE_API_CREEE'
    );
    const donnees = cle.donnees();
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(adaptateurJournal.dernierEvenementConsigne().donnees).toEqual({
      idCle: hache(donnees.id),
      idUtilisateur: hache(unUUID('U')),
      dureeValiditeEnJours: 30,
      dateCreation: donnees.dateCreation,
      dateExpiration: donnees.dateExpiration,
    });
  });
});
