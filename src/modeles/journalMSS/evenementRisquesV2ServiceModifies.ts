import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { RisquesV2 } from '../../moteurRisques/v2/risquesV2.js';

type Donnees = { idService: UUID; risques: RisquesV2 };

export class EvenementRisquesV2ServiceModifies extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'RISQUES_V2_SERVICE_MODIFIES';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idService', 'risques'];
  }

  protected override donneesAConsigner(
    { idService, risques }: Donnees,
    hache: Hacheur
  ) {
    const { risques: risquesGeneraux, risquesSpecifiques } = risques.toJSON();

    return {
      idService: hache(idService),
      risquesGeneraux: risquesGeneraux.map((r) => ({
        id: r.id,
        desactive: r.desactive ?? false,
        avecCommentaire: !!r.commentaire,
        valeurGraviteCalculee: r.graviteCalculee,
        valeurGraviteSurchargee: r.graviteeSurchargee ?? null,
      })),
      risquesSpecifiques: risquesSpecifiques.map((risque) => ({
        id: hache(risque.id),
        valeurVraisemblance: risque.vraisemblance,
        valeurGravite: risque.gravite,
        valeurVraisemblanceBrute: risque.vraisemblanceBrute,
        valeurGraviteBrute: risque.graviteBrute,
        categories: risque.categories,
        avecCommentaire: !!risque.commentaire,
      })),
    };
  }
}
