import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.js';
import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';

type JournalPourLesTests = AdaptateurJournalMSS & {
  evenementsConsignes: () => EvenementJournal[];
  dernierEvenementConsigne: () => EvenementJournal;
};

const fabriqueJournalPourLesTests = (): JournalPourLesTests => {
  const evenementsConsignes: EvenementJournal[] = [];

  return {
    ...AdaptateurJournalMSSMemoire.nouvelAdaptateur(),
    consigneEvenement: async (evenement) => {
      evenementsConsignes.push(evenement);
    },
    evenementsConsignes: () => evenementsConsignes,
    dernierEvenementConsigne: () => {
      const dernier = evenementsConsignes.at(-1);
      if (!dernier) throw new Error('Aucun événement consigné dans le journal');
      return dernier;
    },
  };
};

export { fabriqueJournalPourLesTests, type JournalPourLesTests };
