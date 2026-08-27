import { UUID } from '../typesBasiques.js';

export enum StatutLecture {
  lue = 'lue',
  nonLue = 'nonLue',
}

export type TypeNotification = 'nouveaute' | 'tache';

export type CanalDiffusion = 'centreNotifications' | 'page';

export type NotificationDuCentre = {
  id: string;
  type: TypeNotification;
  titre: string;
  titreCta: string;
  lien: string;
  canalDiffusion: CanalDiffusion;
  statutLecture: StatutLecture;
  doitNotifierLecture: boolean;
  horodatage?: Date;
};

export interface SourceNotifications {
  notificationsPour(idUtilisateur: UUID): Promise<NotificationDuCentre[]>;
}
