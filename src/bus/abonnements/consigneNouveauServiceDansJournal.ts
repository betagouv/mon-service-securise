import EvenementNouveauServiceCree from '../../modeles/journalMSS/evenementNouveauServiceCree.js';
import { EvenementNouveauServiceCree as MssNouveauServiceCree } from '../evenementNouveauServiceCree.js';
import { UUID } from '../../typesBasiques.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';

const leveException = (raison: 'service' | 'créateur') => {
  throw new Error(
    `Impossible de consigner un nouveau service dans le journal MSS sans avoir le ${raison} en paramètre.`
  );
};

function consigneNouveauServiceDansJournal({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
}) {
  return async (evenement: MssNouveauServiceCree) => {
    const { service, utilisateur } = evenement;

    if (!service) leveException('service');
    if (!utilisateur) leveException('créateur');

    const creation = new EvenementNouveauServiceCree({
      idService: service.id,
      idUtilisateur: utilisateur.id as UUID,
      versionService: service.version(),
    });

    await adaptateurJournal.consigneEvenement(creation.toJSON());
  };
}

export { consigneNouveauServiceDansJournal };
