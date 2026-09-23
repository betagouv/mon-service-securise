import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneCleApiCreeeDansJournal } from '../../../src/bus/abonnements/consigneCleApiCreeeDansJournal.ts';
import { EvenementCleApiCreee } from '../../../src/bus/evenementCleApiCreee.ts';
import { CleApi } from '../../../src/modeles/cleApi.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne une clé d'API créée dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de clé créée', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const { cle } = CleApi.nouvelle(unUUID('U'), 30, (valeur) => valeur);

    await consigneCleApiCreeeDansJournal({ adaptateurJournal })(
      new EvenementCleApiCreee({ cle, dureeValiditeEnJours: 30 })
    );

    expect(evenementRecu!.type).toEqual('CLE_API_CREEE');
    const donnees = cle.donnees();
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idCle: hache(donnees.id),
      idUtilisateur: hache(unUUID('U')),
      dureeValiditeEnJours: 30,
      dateCreation: donnees.dateCreation,
      dateExpiration: donnees.dateExpiration,
    });
  });
});
