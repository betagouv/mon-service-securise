import { consigneDansJournal } from './consigneDansJournal.js';
import { EvenementCollaboratifServiceModifie } from '../../modeles/journalMSS/evenementCollaboratifServiceModifie.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { EvenementNouveauServiceCree } from '../evenementNouveauServiceCree.js';
import { UUID } from '../../typesBasiques.js';

const { PROPRIETAIRE } = Autorisation.RESUME_NIVEAU_DROIT;

const consigneProprietaireCreeUnServiceDansJournal = consigneDansJournal(
  ({ service, utilisateur }: EvenementNouveauServiceCree) =>
    new EvenementCollaboratifServiceModifie({
      idService: service.id,
      autorisations: [
        { idUtilisateur: utilisateur.id as UUID, droit: PROPRIETAIRE },
      ],
    })
);

export { consigneProprietaireCreeUnServiceDansJournal };
