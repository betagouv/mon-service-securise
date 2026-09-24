import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementAccesUtilisateurAdministreRetires from '../../modeles/journalMSS/evenementAccesUtilisateurAdministreRetires.js';
import { EvenementAccesUtilisateurAdministreRetires as MssAccesUtilisateurAdministreRetires } from '../evenementAccesUtilisateurAdministreRetires.js';

const consigneAccesUtilisateurAdministreRetiresDansJournal =
  consigneDansJournal(
    ({
      idAdmin,
      idUtilisateurAdministre,
      idsServices,
    }: MssAccesUtilisateurAdministreRetires) =>
      new EvenementAccesUtilisateurAdministreRetires({
        idAdmin,
        idUtilisateurAdministre,
        idsServices,
      })
  );

export { consigneAccesUtilisateurAdministreRetiresDansJournal };
