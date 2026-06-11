import { EvenementAdminNommeSurOrganisation as MssAdminNommeSurOrganisation } from '../evenementAdminNommeSurOrganisation.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementAdminNommeSurOrganisation from '../../modeles/journalMSS/evenementAdminNommeSurOrganisation.js';

const leveException = (raison: keyof MssAdminNommeSurOrganisation) => {
  throw new Error(
    `Impossible de consigner une nomination d'admin sur une organisation sans avoir ${raison} en paramètre.`
  );
};

export function consigneAdminNommeSurOrganisationDansJournal({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
}) {
  return async (evenement: MssAdminNommeSurOrganisation) => {
    const { idActeur, idCible, siret } = evenement;

    if (!idActeur) leveException('idActeur');
    if (!idCible) leveException('idCible');
    if (!siret) leveException('siret');

    await adaptateurJournal.consigneEvenement(
      new EvenementAdminNommeSurOrganisation({
        idActeur,
        idCible,
        siret,
      }).toJSON()
    );
  };
}
