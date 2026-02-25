import ListeRisques from './listeRisques.js';
import RisqueSpecifique, {
  DonneesRisqueSpecifique,
} from './risqueSpecifique.js';
import { Referentiel } from '../referentiel.interface.js';

type DonneesRisquesSpecifiques = {
  risquesSpecifiques: DonneesRisqueSpecifique[];
};

class RisquesSpecifiques extends ListeRisques<RisqueSpecifique> {
  constructor(donnees: DonneesRisquesSpecifiques, referentiel: Referentiel) {
    const { risquesSpecifiques } = donnees;
    super(RisqueSpecifique, { items: risquesSpecifiques }, referentiel);
  }

  metsAJourRisque(risque: RisqueSpecifique) {
    const risqueExistant = this.trouveParId(risque.id);
    risque.identifiantNumerique = risqueExistant.identifiantNumerique;
    super.metsAJourRisque(risque);
  }
}

export default RisquesSpecifiques;
