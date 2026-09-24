import { consigneDansJournal } from './consigneDansJournal.js';
import { EvenementMesureModifieeEnMasse } from '../../modeles/journalMSS/evenementMesureModifieeEnMasse.js';
import MssMesureModifieeEnMasse from '../evenementMesureModifieeEnMasse.js';

const consigneModificationMesureEnMasseDansJournal = consigneDansJournal(
  ({
    typeMesure,
    idMesure,
    utilisateur,
    statutModifie,
    modalitesModifiees,
    nombreServicesConcernes,
  }: MssMesureModifieeEnMasse) =>
    new EvenementMesureModifieeEnMasse({
      type: typeMesure,
      idMesure,
      statutModifie,
      modalitesModifiees,
      nombreServicesConcernes,
      idUtilisateur: utilisateur.id,
    })
);

export { consigneModificationMesureEnMasseDansJournal };
