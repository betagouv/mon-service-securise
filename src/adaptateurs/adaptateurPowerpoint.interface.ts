import { PieceDuDossier } from '../modeles/objetsPowerpoint/piecesDuDossier.js';
import { ContexteDuService } from '../modeles/objetsPowerpoint/contexteDuService.js';
import { BesoinsDeSecurite } from '../modeles/objetsPowerpoint/besoinsDeSecurite.js';

export type AutoriteHomologation = {
  nom: string;
  fonction: string;
};

export type DonneesSupportCommissionHomologation = {
  dateCreation: Date;
  autorite?: AutoriteHomologation;
  piecesDuDossier: PieceDuDossier[];
  contexte: ContexteDuService;
  besoinsDeSecurite: BesoinsDeSecurite;
};

export interface AdaptateurPowerpoint {
  genereSupportCommissionHomologation: (
    donnees: DonneesSupportCommissionHomologation
  ) => Promise<Buffer>;
}
