import { consigneDansJournal } from './consigneDansJournal.js';
import { EvenementCollaboratifServiceModifie } from '../../modeles/journalMSS/evenementCollaboratifServiceModifie.js';
import { EvenementAutorisationsServiceModifiees } from '../evenementAutorisationsServiceModifiees.js';

const consigneAutorisationsModifieesDansJournal = consigneDansJournal(
  ({ idService, autorisations }: EvenementAutorisationsServiceModifiees) =>
    new EvenementCollaboratifServiceModifie({ idService, autorisations })
);

export { consigneAutorisationsModifieesDansJournal };
