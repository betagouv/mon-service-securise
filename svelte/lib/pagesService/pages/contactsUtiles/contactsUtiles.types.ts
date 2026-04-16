export type TypePartiePrenante =
  | 'Hebergement'
  | 'DeveloppementFourniture'
  | 'MaintenanceService'
  | 'SecuriteService';

type DonneesPartiePrenante = {
  nom: string;
  natureAcces: string;
  pointContact: string;
};

export type ActeurHomologation = {
  nom: string;
  fonction: string;
};

export type ContactsUtiles = {
  autoriteHomologation: ActeurHomologation;
  expertCybersecurite: ActeurHomologation;
  delegueProtectionDonnees: ActeurHomologation;
  piloteProjet: ActeurHomologation;
  acteursHomologation: Array<
    ActeurHomologation & {
      role: string;
    }
  >;
  partiesPrenantes: Record<TypePartiePrenante, DonneesPartiePrenante>;
  partiesPrenantesSpecifiques: Array<DonneesPartiePrenante>;
};
