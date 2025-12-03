import EvenementSimulationMigrationReferentielCreee from '../../modeles/journalMSS/evenementSimulationMigrationReferentielCreee.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import type Service from '../../modeles/service.js';

const leveException = (raison: string) => {
  throw new Error(
    `Impossible de consigner la création de simulation de migration du référentiel dans le journal MSS sans avoir le ${raison} en paramètre.`
  );
};

function consigneSimulationMigrationReferentielCreee({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
}) {
  return async (evenement: { service: Service }) => {
    const { service } = evenement;

    if (!service) leveException('service');

    const creation = new EvenementSimulationMigrationReferentielCreee({
      idService: service.id,
    });

    await adaptateurJournal.consigneEvenement(creation.toJSON());
  };
}

export { consigneSimulationMigrationReferentielCreee };
