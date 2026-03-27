import { TousReferentiels } from '../referentiel.interface.js';
import { IdNatureSuggestionAction } from '../referentiel.types.js';
import { NiveauPermission, Rubrique } from './autorisations/gestionDroits.js';

export type DonneesSuggestionAction = {
  nature: IdNatureSuggestionAction;
};

class SuggestionAction {
  private readonly nature: IdNatureSuggestionAction;
  readonly lien: string;
  private readonly priorite: number;
  private permissionRequise: { rubrique: Rubrique; niveau: NiveauPermission };

  constructor(donnees: DonneesSuggestionAction, referentiel: TousReferentiels) {
    const { nature } = donnees;

    this.nature = nature;

    const natureDansReferentiel = referentiel.natureSuggestionAction(nature);

    this.lien = natureDansReferentiel.lien;
    this.priorite = natureDansReferentiel.priorite;
    this.permissionRequise = natureDansReferentiel.permissionRequise;
  }

  route() {
    return {
      rubrique: this.permissionRequise.rubrique,
      niveau: this.permissionRequise.niveau,
      route: this.lien,
    };
  }
}

export default SuggestionAction;
