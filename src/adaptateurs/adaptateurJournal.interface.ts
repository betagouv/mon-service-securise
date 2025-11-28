export type EvenementJournal = {
  type: string;
  date: Date;
  donnees: Record<string, unknown>;
};

export interface AdaptateurJournal {
  consigneEvenement(evenement: EvenementJournal): Promise<void>;
}
