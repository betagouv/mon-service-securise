import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../adaptateurs/adaptateurJournalMSS.interface.js';

type EvenementDuJournal = { toJSON: () => EvenementJournal };

type AvecJournal<Dependances> = {
  adaptateurJournal: AdaptateurJournalMSS;
} & Dependances;

const consigneDansJournal =
  <EvenementBus, Dependances extends object = object>(
    convertis: (
      evenement: EvenementBus,
      dependances: AvecJournal<Dependances>
    ) => EvenementDuJournal
  ) =>
  (dependances: AvecJournal<Dependances>) =>
  async (evenement: EvenementBus) => {
    const evenementJournal = convertis(evenement, dependances);
    await dependances.adaptateurJournal.consigneEvenement(
      evenementJournal.toJSON()
    );
  };

export { consigneDansJournal };
