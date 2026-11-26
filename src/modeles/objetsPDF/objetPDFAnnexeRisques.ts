import type Service from '../service.js';
import { creeReferentielVide } from '../../referentiel.js';
import { Referentiel } from '../../referentiel.interface.js';
import type RisqueGeneral from '../risqueGeneral.js';
import type RisqueSpecifique from '../risqueSpecifique.js';

type RisqueDuService = RisqueGeneral | RisqueSpecifique;

type GrilleRisques = Array<Array<string[] | null>>;

const TAILLE_GRILLE = 4;

const estDesactive = (risque: RisqueDuService) =>
  'desactive' in risque && !!risque.desactive;

class ObjetPDFAnnexeRisques {
  private readonly service: Service;
  private readonly referentiel: Referentiel;
  private readonly risques: RisqueDuService[];

  constructor(
    service: Service,
    referentiel: Referentiel = creeReferentielVide()
  ) {
    this.referentiel = referentiel;
    this.service = service;
    this.risques = [
      ...this.service.risquesGeneraux().tous(),
      ...this.service.risquesSpecifiques().tous(),
    ];
  }

  private positionVraisemblance(risque: RisqueDuService): number {
    return this.referentiel.niveauxVraisemblance()[risque.niveauVraisemblance]
      .position;
  }

  private positionGravite(risque: RisqueDuService): number {
    return this.referentiel.niveauxGravite()[risque.niveauGravite].position;
  }

  calculeGrille(): GrilleRisques {
    const resultat: GrilleRisques = Array.from({ length: TAILLE_GRILLE }, () =>
      Array(TAILLE_GRILLE).fill(null)
    );

    const risquesCartographies = this.risques.filter(
      (risque) =>
        risque.niveauGravite &&
        risque.niveauVraisemblance &&
        this.positionVraisemblance(risque) > 0 &&
        this.positionGravite(risque) > 0 &&
        !estDesactive(risque)
    );

    risquesCartographies.forEach((risque) => {
      const x = this.positionVraisemblance(risque) - 1;
      const y = Math.abs(TAILLE_GRILLE - this.positionGravite(risque));
      resultat[y][x] = resultat[y][x] || [];
      resultat[y][x].push(risque.identifiantNumeriqueRisque());
    });
    return resultat;
  }

  donnees() {
    return {
      nomService: this.service.nomService(),
      risques: this.risques
        .filter((risque) => !estDesactive(risque))
        .map((risque) => risque.toJSON()),
      grilleRisques: this.calculeGrille(),
      matriceNiveauxRisque: this.referentiel.matriceNiveauxRisques(),
    };
  }
}

export default ObjetPDFAnnexeRisques;
