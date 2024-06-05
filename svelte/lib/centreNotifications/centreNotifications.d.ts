export type Notification = {
  id: string;
  titre: string;
  image: string;
  sousTitre: string;
  dateDeDeploiement: string;
  statutLecture: 'lue' | 'nonLue';
  lien: string;
};
