import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneGroupeServicesSupprimeDansJournal } from '../../../src/bus/abonnements/consigneGroupeServicesSupprimeDansJournal.ts';
import { EvenementGroupeServicesSupprime } from '../../../src/bus/evenementGroupeServicesSupprime.ts';
import { GroupeServices } from '../../../src/modeles/groupeServices.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne un groupe de services supprimé dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de groupe supprimé', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const groupe = GroupeServices.nouveau(unUUID('U'), 'Métier');

    await consigneGroupeServicesSupprimeDansJournal({ adaptateurJournal })(
      new EvenementGroupeServicesSupprime({ groupe })
    );

    expect(evenementRecu!.type).toEqual('GROUPE_SERVICES_SUPPRIME');
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idGroupe: hache(groupe.donnees().id),
      idUtilisateur: hache(unUUID('U')),
    });
  });
});
