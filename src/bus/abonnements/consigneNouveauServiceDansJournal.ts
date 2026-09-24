import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementNouveauServiceCree from '../../modeles/journalMSS/evenementNouveauServiceCree.js';
import { EvenementNouveauServiceCree as MssNouveauServiceCree } from '../evenementNouveauServiceCree.js';
import { UUID } from '../../typesBasiques.js';

const consigneNouveauServiceDansJournal = consigneDansJournal(
  ({ service, utilisateur }: MssNouveauServiceCree) =>
    new EvenementNouveauServiceCree({
      idService: service.id,
      idUtilisateur: utilisateur.id as UUID,
      versionService: service.version(),
    })
);

export { consigneNouveauServiceDansJournal };
