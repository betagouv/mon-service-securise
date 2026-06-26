import Evenement from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { RisquesV2 } from '../../moteurRisques/v2/risquesV2.js';

export class EvenementRisquesV2ServiceModifies extends Evenement {
  constructor(idService: UUID, risques: RisquesV2, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    super(
      'RISQUES_V2_SERVICE_MODIFIES',
      {
        idService: adaptateurChiffrement.hacheSha256(idService),
        risquesGeneraux: risques.toJSON().risques.map((r) => ({
          id: r.id,
          desactive: r.desactive ?? false,
          avecCommentaire: !!r.commentaire,
          valeurGraviteCalculee: r.graviteCalculee,
          valeurGraviteSurchargee: r.graviteeSurchargee ?? null,
        })),
      },
      date
    );
  }
}
