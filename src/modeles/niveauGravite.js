import { ErreurNiveauGraviteInconnu } from '../erreurs.js';
import * as Referentiel from '../referentiel.js';

const valide = (idNiveau, referentiel) => {
  const identifiantsNiveauxGravite = referentiel.identifiantsNiveauxGravite();
  if (idNiveau && !identifiantsNiveauxGravite.includes(idNiveau)) {
    throw new ErreurNiveauGraviteInconnu(
      `Le niveau de gravité "${idNiveau}" n'est pas répertorié`
    );
  }
};

class NiveauGravite {
  constructor(idNiveau, referentiel = Referentiel.creeReferentielVide()) {
    valide(idNiveau, referentiel);

    const { position, description, important } =
      referentiel.niveauGravite(idNiveau);
    this.position = position;
    this.description = description;
    this.important = important;
  }

  descriptionNiveau() {
    return this.description || 'Non renseigné';
  }

  niveauImportant() {
    return !!this.important;
  }
}

export default NiveauGravite;
