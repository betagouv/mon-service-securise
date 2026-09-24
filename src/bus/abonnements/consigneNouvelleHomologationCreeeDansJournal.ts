import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementNouvelleHomologationCreee from '../../modeles/journalMSS/evenementNouvelleHomologationCreee.js';
import { UUID } from '../../typesBasiques.js';
import Dossier from '../../modeles/dossier.js';
import { Referentiel } from '../../referentiel.interface.js';

type NouvelleHomologation = {
  idService: UUID;
  dossier: Dossier;
  importe?: boolean;
};

const consigneNouvelleHomologationCreeeDansJournal = consigneDansJournal(
  (
    { idService, dossier, importe }: NouvelleHomologation,
    { referentiel }: { referentiel: Referentiel }
  ) => {
    const { dateHomologation, dureeValidite, refusee } = dossier.decision;
    const dureeHomologationMois = dureeValidite
      ? referentiel.nbMoisDecalage(dureeValidite)
      : undefined;

    return new EvenementNouvelleHomologationCreee({
      idService,
      dateHomologation,
      dureeHomologationMois,
      refusee,
      importe,
    });
  }
);

export { consigneNouvelleHomologationCreeeDansJournal };
