import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementModelesMesureSpecifiqueImportes from '../../modeles/journalMSS/evenementModelesMesureSpecifiqueImportes.js';
import MssModelesMesureSpecifiqueImportes from '../evenementModelesMesureSpecifiqueImportes.js';

const consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal =
  consigneDansJournal(
    ({
      idUtilisateur,
      nbModelesMesureSpecifiqueImportes,
    }: MssModelesMesureSpecifiqueImportes) =>
      new EvenementModelesMesureSpecifiqueImportes({
        idUtilisateur,
        nbModelesMesureSpecifiqueImportes,
      })
  );

export { consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal };
