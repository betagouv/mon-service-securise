import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementAdminNommeSurOrganisation from '../../modeles/journalMSS/evenementAdminNommeSurOrganisation.js';
import { EvenementAdminNommeSurOrganisation as MssAdminNommeSurOrganisation } from '../evenementAdminNommeSurOrganisation.js';

const consigneAdminNommeSurOrganisationDansJournal = consigneDansJournal(
  ({ idActeur, idCible, siret }: MssAdminNommeSurOrganisation) =>
    new EvenementAdminNommeSurOrganisation({ idActeur, idCible, siret })
);

export { consigneAdminNommeSurOrganisationDansJournal };
