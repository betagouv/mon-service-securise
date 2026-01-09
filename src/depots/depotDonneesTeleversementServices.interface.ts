import { UUID } from '../typesBasiques.js';
import TeleversementServicesV2 from '../modeles/televersement/televersementServicesV2.js';
import { LigneServiceTeleverseV2 } from '../modeles/televersement/serviceTeleverseV2.js';
import { VersionService } from '../modeles/versionService.js';

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
    donneesTeleversementServices: LigneServiceTeleverseV2[],
    versionService: VersionService
  ) => Promise<UUID>;
  supprimeTeleversementServices: (idUtilisateur: UUID) => Promise<void>;
}
