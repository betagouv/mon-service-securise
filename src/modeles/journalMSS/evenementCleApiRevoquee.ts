import Evenement, { Hacheur } from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementCleApiRevoquee = {
  idCle: UUID;
  idUtilisateur: UUID;
  dateRevocation: Date;
};

class EvenementCleApiRevoquee extends Evenement<DonneesEvenementCleApiRevoquee> {
  protected override typeEvenement() {
    return 'CLE_API_REVOQUEE';
  }

  protected override proprietesRequises(): (keyof DonneesEvenementCleApiRevoquee)[] {
    return ['idCle', 'idUtilisateur', 'dateRevocation'];
  }

  protected override donneesAConsigner(
    { idCle, idUtilisateur, dateRevocation }: DonneesEvenementCleApiRevoquee,
    hache: Hacheur
  ) {
    return {
      idCle: hache(idCle),
      idUtilisateur: hache(idUtilisateur),
      dateRevocation,
    };
  }
}

export default EvenementCleApiRevoquee;
