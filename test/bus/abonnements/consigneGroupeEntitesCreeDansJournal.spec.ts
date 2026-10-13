import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneGroupeEntitesCreeDansJournal } from '../../../src/bus/abonnements/consigneGroupeEntitesCreeDansJournal.ts';
import { EvenementGroupeEntitesCree } from '../../../src/bus/evenementGroupeEntitesCree.ts';
import { GroupeEntites } from '../../../src/modeles/groupeEntites.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne un groupe d'entités créé dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de groupe créé', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const groupe = GroupeEntites.nouveau(unUUID('U'), 'Région Nord');

    await consigneGroupeEntitesCreeDansJournal({ adaptateurJournal })(
      new EvenementGroupeEntitesCree({ groupe })
    );

    expect(evenementRecu!.type).toEqual('GROUPE_ENTITES_CREE');
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idGroupe: hache(groupe.donnees().id),
      idUtilisateur: hache(unUUID('U')),
    });
  });
});
