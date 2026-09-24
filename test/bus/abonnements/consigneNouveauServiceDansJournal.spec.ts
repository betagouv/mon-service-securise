import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { consigneNouveauServiceDansJournal } from '../../../src/bus/abonnements/consigneNouveauServiceDansJournal.ts';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';

describe("L'abonnement qui consigne la création d'un nouveau service dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de nouveau service créé', async () => {
    await consigneNouveauServiceDansJournal({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toEqual(
      'NOUVEAU_SERVICE_CREE'
    );
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    const payload = {
      service: unService().construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    };
    // @ts-expect-error On supprime le service.
    delete payload.service;

    await expect(
      consigneNouveauServiceDansJournal({ adaptateurJournal })(payload)
    ).rejects.toThrowError(
      'Impossible de consigner un nouveau service dans le journal MSS sans avoir le service en paramètre.'
    );
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    const payload = {
      service: unService().construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    };
    // @ts-expect-error On supprime utilisateur.
    delete payload.utilisateur;

    await expect(
      consigneNouveauServiceDansJournal({ adaptateurJournal })(payload)
    ).rejects.toThrowError(
      'Impossible de consigner un nouveau service dans le journal MSS sans avoir le créateur en paramètre.'
    );
  });
});
