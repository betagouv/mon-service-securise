export type EvenementJournal = {
  type: string;
  date: Date;
  donnees: Record<string, unknown>;
};

export interface AdaptateurJournalMSS {
  consigneEvenement(evenement: EvenementJournal): Promise<void>;
}
