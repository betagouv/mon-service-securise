import { EvenementAdminRetireDeOrganisation as MssAdminRetireDeOrganisation } from '../evenementAdminRetireDeOrganisation.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementAdminRetireDeOrganisation from '../../modeles/journalMSS/evenementAdminRetireDeOrganisation.js';

const leveException = (raison: keyof MssAdminRetireDeOrganisation) => {
  throw new Error(
    `Impossible de consigner un retrait d'admin d'une organisation sans avoir ${raison} en paramètre.`
  );
};

export function consigneAdminRetireDeOrganisationDansJournal({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
}) {
  return async (evenement: MssAdminRetireDeOrganisation) => {
    const { idActeur, idCible, siret } = evenement;

    if (!idActeur) leveException('idActeur');
    if (!idCible) leveException('idCible');
    if (!siret) leveException('siret');

    await adaptateurJournal.consigneEvenement(
      new EvenementAdminRetireDeOrganisation({
        idActeur,
        idCible,
        siret,
      }).toJSON()
    );
  };
}
