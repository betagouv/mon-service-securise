import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementServicesImportes from '../../modeles/journalMSS/evenementServicesImportes.js';
import MssServicesImportes from '../evenementServicesImportes.js';

const consigneTeleversementServicesRealiseDansJournal = consigneDansJournal(
  ({ idUtilisateur, nbServicesImportes }: MssServicesImportes) =>
    new EvenementServicesImportes({ idUtilisateur, nbServicesImportes })
);

export { consigneTeleversementServicesRealiseDansJournal };
