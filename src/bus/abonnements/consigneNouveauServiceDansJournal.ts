import EvenementNouveauServiceCree from '../../modeles/journalMSS/evenementNouveauServiceCree.js';
import Service from '../../modeles/service.js';
import Utilisateur from '../../modeles/utilisateur.js';
import { UUID } from '../../typesBasiques.js';
import { AdaptateurJournal } from '../../adaptateurs/adaptateurJournal.interface.js';

const leveException = (raison: 'service' | 'créateur') => {
  throw new Error(
    `Impossible de consigner un nouveau service dans le journal MSS sans avoir le ${raison} en paramètre.`
  );
};

function consigneNouveauServiceDansJournal({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournal;
}) {
  return async (evenement: { service: Service; utilisateur: Utilisateur }) => {
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
