import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementAdminRetireDeOrganisation from '../../modeles/journalMSS/evenementAdminRetireDeOrganisation.js';
import { EvenementAdminRetireDeOrganisation as MssAdminRetireDeOrganisation } from '../evenementAdminRetireDeOrganisation.js';

const consigneAdminRetireDeOrganisationDansJournal = consigneDansJournal(
  ({ idActeur, idCible, siret }: MssAdminRetireDeOrganisation) =>
    new EvenementAdminRetireDeOrganisation({ idActeur, idCible, siret })
);

export { consigneAdminRetireDeOrganisationDansJournal };
