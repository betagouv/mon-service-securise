import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneEntitesDuGroupeModifieesDansJournal } from '../../../src/bus/abonnements/consigneEntitesDuGroupeModifieesDansJournal.ts';
import { EvenementEntitesDuGroupeModifiees } from '../../../src/bus/evenementEntitesDuGroupeModifiees.ts';
import { GroupeEntites } from '../../../src/modeles/groupeEntites.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne les entités modifiées d'un groupe dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it("consigne un événement d'entités du groupe modifiées avec le nombre d'entités associées", async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const groupe = GroupeEntites.hydrate({
      id: unUUID('G'),
      idUtilisateur: unUUID('U'),
      libelle: 'Région Nord',
      siretsAssocies: ['11111111100011', '22222222200022'],
    });

    await consigneEntitesDuGroupeModifieesDansJournal({ adaptateurJournal })(
      new EvenementEntitesDuGroupeModifiees({ groupe })
    );

    expect(evenementRecu!.type).toEqual('ENTITES_DU_GROUPE_MODIFIEES');
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idGroupe: hache(unUUID('G')),
      idUtilisateur: hache(unUUID('U')),
      nombreEntitesAssociees: 2,
    });
  });
});
