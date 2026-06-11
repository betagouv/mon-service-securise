import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneAdminNommeSurOrganisationDansJournal } from '../../../src/bus/abonnements/consigneAdminNommeSurOrganisationDansJournal.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne la nomination d'un admin sur une organisation dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it("consigne un événement de nomination d'admin sur une organisation", async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneAdminNommeSurOrganisationDansJournal({
      adaptateurJournal,
    })({
      idActeur: unUUIDRandom(),
      idCible: unUUIDRandom(),
      siret: '12345678901234',
    });

    expect(evenementRecu!.type).toEqual('ADMIN_NOMME_SUR_ORGANISATION');
  });

  it.each(['idActeur', 'idCible', 'siret'])(
    "lève une exception s'il ne reçoit pas de %s",
    async (proprieteObligatoire) => {
      const payload = {
        idActeur: unUUIDRandom(),
        idCible: unUUIDRandom(),
        siret: '12345678901234',
      };
      // @ts-expect-error On supprime la propriété
      delete payload[proprieteObligatoire];

      await expect(
        consigneAdminNommeSurOrganisationDansJournal({
          adaptateurJournal,
        })(payload)
      ).rejects.toThrow(
        `Impossible de consigner une nomination d'admin sur une organisation sans avoir ${proprieteObligatoire} en paramètre.`
      );
    }
  );
});
