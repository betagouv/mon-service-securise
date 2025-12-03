import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { consigneSimulationMigrationReferentielCreee } from '../../../src/bus/abonnements/consigneSimulationMigrationReferentielCreeeDansJournal.js';

describe("L'abonnement qui consigne la création d'une simulation de migration de référentiel dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de simulation créée', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneSimulationMigrationReferentielCreee({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
    });

    expect(evenementRecu.type).to.equal(
      'SIMULATION_MIGRATION_REFERENTIEL_CREEE'
    );
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    await expect(
      consigneSimulationMigrationReferentielCreee({ adaptateurJournal })({
        service: null,
      })
    ).rejects.toThrow(
      'Impossible de consigner la création de simulation de migration du référentiel dans le journal MSS sans avoir le service en paramètre.'
    );
  });
});
