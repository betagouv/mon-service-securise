import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementServiceMigreEnV2 from '../../modeles/journalMSS/evenementServiceMigreEnV2.js';
import EvenementServiceV1MigreEnV2 from '../evenementServiceV1MigreEnV2.js';

const consigneServiceV1MigreEnV2 = consigneDansJournal(
  ({ service, utilisateur }: EvenementServiceV1MigreEnV2) =>
    new EvenementServiceMigreEnV2({
      idService: service.id,
      idUtilisateur: utilisateur.id,
    })
);

export { consigneServiceV1MigreEnV2 };
