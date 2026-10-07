import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneGroupeServicesCreeDansJournal } from '../../../src/bus/abonnements/consigneGroupeServicesCreeDansJournal.ts';
import { EvenementGroupeServicesCree } from '../../../src/bus/evenementGroupeServicesCree.ts';
import { GroupeServices } from '../../../src/modeles/groupeServices.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne un groupe de services créé dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de groupe créé', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const groupe = GroupeServices.nouveau(unUUID('U'), 'Métier');

    await consigneGroupeServicesCreeDansJournal({ adaptateurJournal })(
      new EvenementGroupeServicesCree({ groupe })
    );

    expect(evenementRecu!.type).toEqual('GROUPE_SERVICES_CREE');
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idGroupe: hache(groupe.donnees().id),
      idUtilisateur: hache(unUUID('U')),
    });
  });
});
