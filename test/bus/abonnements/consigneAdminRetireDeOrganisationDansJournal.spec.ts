import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneAdminRetireDeOrganisationDansJournal } from '../../../src/bus/abonnements/consigneAdminRetireDeOrganisationDansJournal.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne le retrait d'un admin d'une organisation dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it("consigne un événement de retrait d'admin d'une organisation", async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneAdminRetireDeOrganisationDansJournal({
      adaptateurJournal,
    })({
      idActeur: unUUIDRandom(),
      idCible: unUUIDRandom(),
      siret: '12345678901234',
    });

    expect(evenementRecu!.type).toEqual('ADMIN_RETIRE_DE_ORGANISATION');
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
        consigneAdminRetireDeOrganisationDansJournal({
          adaptateurJournal,
        })(payload)
      ).rejects.toThrow(
        `Impossible de consigner un retrait d'admin d'une organisation sans avoir ${proprieteObligatoire} en paramètre.`
      );
    }
  );
});
