import InformationsService from './informationsService.js';
import RisquesGeneraux, { DonneesRisquesGeneraux } from './risquesGeneraux.js';
import RisquesSpecifiques, {
  DonneesRisquesSpecifiques,
} from './risquesSpecifiques.js';
import { creeReferentielVide } from '../referentiel.js';
import { Referentiel } from '../referentiel.interface.js';
import ListeRisques from './listeRisques.js';
import Risque from './risque.js';

export type DonneesRisques = DonneesRisquesGeneraux & DonneesRisquesSpecifiques;

class Risques extends InformationsService {
  readonly risquesGeneraux!: RisquesGeneraux;
  readonly risquesSpecifiques!: RisquesSpecifiques;
  private readonly referentiel: Referentiel;

  constructor(
    donnees: Partial<DonneesRisques> = {},
    referentiel: Referentiel = creeReferentielVide()
  ) {
    super({
      listesAgregats: {
        // @ts-expect-error On devrait rendre générique le `ConstructeurAgregat`
        risquesGeneraux: RisquesGeneraux,
        // @ts-expect-error On devrait rendre générique le `ConstructeurAgregat`
        risquesSpecifiques: RisquesSpecifiques,
      },
    });

    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  principaux() {
    return [this.risquesGeneraux, this.risquesSpecifiques]
      .flatMap((rs) => (rs as ListeRisques<Risque>).principaux())
      .sort(
        (rs1, rs2) => rs2.positionNiveauGravite() - rs1.positionNiveauGravite()
      );
  }

  parNiveauGravite() {
    const risquesParNiveauGravite = this.risquesGeneraux.parNiveauGravite();
    return this.risquesSpecifiques.parNiveauGravite(risquesParNiveauGravite);
  }
}

export default Risques;
