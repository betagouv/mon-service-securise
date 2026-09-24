import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = {
  idUtilisateur: UUID;
  type: 'generale' | 'specifique';
  idMesure: string;
  statutModifie: boolean;
  modalitesModifiees: boolean;
  nombreServicesConcernes: number;
};

class EvenementMesureModifieeEnMasse extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'MESURE_MODIFIEE_EN_MASSE';
  }

  protected override donneesAConsigner(
    {
      idUtilisateur,
      type,
      idMesure,
      statutModifie,
      modalitesModifiees,
      nombreServicesConcernes,
    }: Donnees,
    hache: Hacheur
  ) {
    return {
      idUtilisateur: hache(idUtilisateur),
      type,
      idMesure,
      statutModifie,
      modalitesModifiees,
      nombreServicesConcernes,
    };
  }
}

export { EvenementMesureModifieeEnMasse };
