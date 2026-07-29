export type EvenementJournal = {
  type: string;
  date: Date;
  donnees: Record<string, unknown>;
};

export type EvolutionMensuelle = Array<{ mois: string; total: number }>;

export interface AdaptateurJournalMSS {
  consigneEvenement(evenement: EvenementJournal): Promise<void>;
  evolutionNombreServices(
    idsServicesHaches: Array<string>
  ): Promise<EvolutionMensuelle>;
  evolutionNombreOrganisations(
    services: Array<{ idServiceHache: string; siretHache: string }>
  ): Promise<EvolutionMensuelle>;
}
