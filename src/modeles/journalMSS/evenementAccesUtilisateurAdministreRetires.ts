import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = {
  idAdmin: UUID;
  idUtilisateurAdministre: UUID;
  idsServices: UUID[];
};

class EvenementAccesUtilisateurAdministreRetires extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'ACCES_UTILISATEUR_ADMINISTRE_RETIRES';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idAdmin', 'idUtilisateurAdministre', 'idsServices'];
  }

  protected override donneesAConsigner(
    { idAdmin, idUtilisateurAdministre, idsServices }: Donnees,
    hache: Hacheur
  ) {
    return {
      idAdmin: hache(idAdmin),
      idUtilisateurAdministre: hache(idUtilisateurAdministre),
      idsServices: idsServices.map(hache),
    };
  }
}

export default EvenementAccesUtilisateurAdministreRetires;
