import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneGroupeEntitesSupprimeDansJournal } from '../../../src/bus/abonnements/consigneGroupeEntitesSupprimeDansJournal.ts';
import { EvenementGroupeEntitesSupprime } from '../../../src/bus/evenementGroupeEntitesSupprime.ts';
import { GroupeEntites } from '../../../src/modeles/groupeEntites.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne un groupe d'entités supprimé dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de groupe supprimé', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const groupe = GroupeEntites.nouveau(unUUID('U'), 'Région Nord');

    await consigneGroupeEntitesSupprimeDansJournal({ adaptateurJournal })(
      new EvenementGroupeEntitesSupprime({ groupe })
    );

    expect(evenementRecu!.type).toEqual('GROUPE_ENTITES_SUPPRIME');
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idGroupe: hache(groupe.donnees().id),
      idUtilisateur: hache(unUUID('U')),
    });
  });
});
