import Evenement from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { RisquesV2 } from '../../moteurRisques/v2/risquesV2.js';

export class EvenementRisquesV2ServiceModifies extends Evenement {
  constructor(idService: UUID, risques: RisquesV2, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const { risques: risquesGeneraux, risquesSpecifiques } = risques.toJSON();

    super(
      'RISQUES_V2_SERVICE_MODIFIES',
      {
        idService: adaptateurChiffrement.hacheSha256(idService),
        risquesGeneraux: risquesGeneraux.map((r) => ({
          id: r.id,
          desactive: r.desactive ?? false,
          avecCommentaire: !!r.commentaire,
          valeurGraviteCalculee: r.graviteCalculee,
          valeurGraviteSurchargee: r.graviteeSurchargee ?? null,
        })),
        risquesSpecifiques: risquesSpecifiques.map((risque) => ({
          id: adaptateurChiffrement.hacheSha256(risque.id),
          valeurVraisemblance: risque.vraisemblance,
          valeurGravite: risque.gravite,
          valeurVraisemblanceBrute: risque.vraisemblanceBrute,
          valeurGraviteBrute: risque.graviteBrute,
          categories: risque.categories,
        })),
      },
      date
    );
  }
}
