import { ErreurNiveauGraviteInconnu } from '../erreurs.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';

export type IdNiveauGravite =
  | 'nonConcerne'
  | 'minime'
  | 'significatif'
  | 'grave'
  | 'critique';

const valide = (idNiveau: string, referentiel: Referentiel | ReferentielV2) => {
  const identifiantsNiveauxGravite = referentiel.identifiantsNiveauxGravite();
  if (idNiveau && !identifiantsNiveauxGravite.includes(idNiveau)) {
    throw new ErreurNiveauGraviteInconnu(
      `Le niveau de gravité "${idNiveau}" n'est pas répertorié`
    );
  }
};

class NiveauGravite {
  readonly position: number;
  private readonly description: string;
  private readonly important?: boolean;

  constructor(
    idNiveau: IdNiveauGravite,
    referentiel: Referentiel | ReferentielV2 = creeReferentielVide()
  ) {
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
