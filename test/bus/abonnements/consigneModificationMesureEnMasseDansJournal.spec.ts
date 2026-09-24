import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneModificationMesureEnMasseDansJournal } from '../../../src/bus/abonnements/consigneModificationMesureEnMasseDansJournal.ts';
import EvenementMesureModifieeEnMasse from '../../../src/bus/evenementMesureModifieeEnMasse.js';

describe("L'abonnement qui consigne la modification en masse d'une mesure dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de mesure modifiée en masse', async () => {
    await consigneModificationMesureEnMasseDansJournal({ adaptateurJournal })(
      new EvenementMesureModifieeEnMasse({
        utilisateur: unUtilisateur().avecId('ABC').construis(),
        idMesure: 'uneMesure',
        statutModifie: true,
        modalitesModifiees: false,
        nombreServicesConcernes: 2,
        typeMesure: 'generale',
      })
    );

    const { type, donnees } = adaptateurJournal.dernierEvenementConsigne();
    expect(type).toBe('MESURE_MODIFIEE_EN_MASSE');
    expect(donnees.idUtilisateur).toBeDefined();
    expect(donnees).toMatchObject({
      idMesure: 'uneMesure',
      statutModifie: true,
      modalitesModifiees: false,
      nombreServicesConcernes: 2,
      type: 'generale',
    });
  });
});
