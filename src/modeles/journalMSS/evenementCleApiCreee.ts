import Evenement, { Hacheur } from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementCleApiCreee = {
  idCle: UUID;
  idUtilisateur: UUID;
  dureeValiditeEnJours: number;
  dateCreation: Date;
  dateExpiration: Date;
};

class EvenementCleApiCreee extends Evenement<DonneesEvenementCleApiCreee> {
  protected override typeEvenement() {
    return 'CLE_API_CREEE';
  }

  protected override proprietesRequises(): (keyof DonneesEvenementCleApiCreee)[] {
    return [
      'idCle',
      'idUtilisateur',
      'dureeValiditeEnJours',
      'dateCreation',
      'dateExpiration',
    ];
  }

  protected override donneesAConsigner(
    {
      idCle,
      idUtilisateur,
      dureeValiditeEnJours,
      dateCreation,
      dateExpiration,
    }: DonneesEvenementCleApiCreee,
    hache: Hacheur
  ) {
    return {
      idCle: hache(idCle),
      idUtilisateur: hache(idUtilisateur),
      dureeValiditeEnJours,
      dateCreation,
      dateExpiration,
    };
  }
}

export default EvenementCleApiCreee;
