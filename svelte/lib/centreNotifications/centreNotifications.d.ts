export type TypeNotification = 'nouveaute' | 'tache';

type NotificationBase = {
  id: string;
  titre: string;
  statutLecture: 'lue' | 'nonLue';
  lien: string;
  type: TypeNotification;
};

export type NotificationNouveaute = NotificationBase & {
  type: 'nouveaute';
  image: string;
  sousTitre: string;
  dateDeDeploiement: string;
};

export type NotificationTache = NotificationBase & {
  type: 'tache';
  titreCta: string;
};

export type Notification = NotificationNouveaute | NotificationTache;
