import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = {
  idUtilisateur: UUID;
  nbModelesMesureSpecifiqueImportes: number;
};

class EvenementModelesMesureSpecifiqueImportes extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'MODELES_MESURE_SPECIFIQUE_IMPORTES';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idUtilisateur', 'nbModelesMesureSpecifiqueImportes'];
  }

  protected override donneesAConsigner(
    { idUtilisateur, nbModelesMesureSpecifiqueImportes }: Donnees,
    hache: Hacheur
  ) {
    return {
      idUtilisateur: hache(idUtilisateur),
      nbModelesMesureSpecifiqueImportes,
    };
  }
}

export default EvenementModelesMesureSpecifiqueImportes;
