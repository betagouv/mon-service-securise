export interface AdaptateurJournalMSS {
  consigneEvenement: (donnees: Record<string, unknown>) => Promise<void>;
}
