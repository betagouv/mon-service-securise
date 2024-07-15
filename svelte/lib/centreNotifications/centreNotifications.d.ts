export type TypeNotification = 'nouveaute' | 'tache';

type NotificationBase = {
  id: string;
  titre: string;
  statutLecture: 'lue' | 'nonLue';
  lien: string;
  type: TypeNotification;
  doitNotifierLecture: boolean;
  horodatage?: string;
};

export type NotificationNouveaute = NotificationBase & {
  type: 'nouveaute';
  image: string;
  sousTitre: string;
};

export type NotificationTache = NotificationBase & {
  type: 'tache';
  titreCta: string;
  entete: string;
};

export type Notification = NotificationNouveaute | NotificationTache;

export type TypeOnglet = 'aFaire' | 'nouveautes' | 'toutes';
