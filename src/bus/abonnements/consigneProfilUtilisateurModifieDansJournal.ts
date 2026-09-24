import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementProfilUtilisateurModifie from '../../modeles/journalMSS/evenementProfilUtilisateurModifie.js';
import Utilisateur from '../../modeles/utilisateur.js';

const consigneProfilUtilisateurModifieDansJournal = consigneDansJournal(
  ({ utilisateur }: { utilisateur: Utilisateur }) =>
    new EvenementProfilUtilisateurModifie(utilisateur)
);

export { consigneProfilUtilisateurModifieDansJournal };
