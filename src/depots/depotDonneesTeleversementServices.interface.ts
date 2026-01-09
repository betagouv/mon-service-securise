import { UUID } from '../typesBasiques.js';
import TeleversementServicesV2 from '../modeles/televersement/televersementServicesV2.js';
import { LigneServiceTeleverseV2 } from '../modeles/televersement/serviceTeleverseV2.js';

export interface DepotDonneesTeleversementServices {
  lisPourcentageProgressionTeleversementServices: (
    idUtilisateur: UUID
  ) => Promise<number | undefined>;
  lisTeleversementServices: (
    idUtilisateur: UUID
  ) => Promise<TeleversementServicesV2 | undefined>;
  metsAJourProgressionTeleversement: (
    idUtilisateur: UUID,
    progression: number
  ) => Promise<void>;
  nouveauTeleversementServices: (
    idUtilisateur: UUID,
    donneesTeleversementServices: LigneServiceTeleverseV2[]
  ) => Promise<UUID>;
  supprimeTeleversementServices: (idUtilisateur: UUID) => Promise<void>;
}
