import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = { idActeur: UUID; idCible: UUID; siret: string };

class EvenementAdminNommeSurOrganisation extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'ADMIN_NOMME_SUR_ORGANISATION';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idActeur', 'idCible', 'siret'];
  }

  protected override donneesAConsigner(
    { idActeur, idCible, siret }: Donnees,
    hache: Hacheur
  ) {
    return {
      idActeur: hache(idActeur),
      idCible: hache(idCible),
      siret: hache(siret),
    };
  }
}

export default EvenementAdminNommeSurOrganisation;
