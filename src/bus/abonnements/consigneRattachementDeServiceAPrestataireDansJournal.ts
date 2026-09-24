import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementServiceRattacheAPrestataire from '../../modeles/journalMSS/evenementServiceRattacheAPrestataire.js';
import { EvenementServiceRattacheAPrestataire as MssServiceRattacheAPrestataire } from '../evenementServiceRattacheAPrestataire.js';

const consigneRattachementDeServiceAPrestataireDansJournal =
  consigneDansJournal(
    ({ idService, codePrestataire }: MssServiceRattacheAPrestataire) =>
      new EvenementServiceRattacheAPrestataire({ idService, codePrestataire })
  );

export { consigneRattachementDeServiceAPrestataireDansJournal };
