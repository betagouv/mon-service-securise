import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneServicesDuGroupeModifiesDansJournal } from '../../../src/bus/abonnements/consigneServicesDuGroupeModifiesDansJournal.ts';
import { EvenementServicesDuGroupeModifies } from '../../../src/bus/evenementServicesDuGroupeModifies.ts';
import { GroupeServices } from '../../../src/modeles/groupeServices.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne la modification des services d'un groupe dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de services du groupe modifiés avec le nombre de services associés', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const groupe = GroupeServices.hydrate({
      id: unUUID('G'),
      idUtilisateur: unUUID('U'),
      libelle: 'Métier',
      idServicesAssocies: [unUUID('S1'), unUUID('S2')],
    });

    await consigneServicesDuGroupeModifiesDansJournal({ adaptateurJournal })(
      new EvenementServicesDuGroupeModifies({ groupe })
    );

    expect(evenementRecu!.type).toEqual('SERVICES_DU_GROUPE_MODIFIES');
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idGroupe: hache(unUUID('G')),
      idUtilisateur: hache(unUUID('U')),
      nombreServicesAssocies: 2,
    });
  });
});
