import InformationsService from './informationsService.js';
import RisquesGeneraux from './risquesGeneraux.js';
import RisquesSpecifiques from './risquesSpecifiques.js';
import * as Referentiel from '../referentiel.js';

class Risques extends InformationsService {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      listesAgregats: {
        risquesGeneraux: RisquesGeneraux,
        risquesSpecifiques: RisquesSpecifiques,
      },
    });

    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  principaux() {
    return [this.risquesGeneraux, this.risquesSpecifiques]
      .flatMap((rs) => rs.principaux())
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
