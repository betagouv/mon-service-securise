import InformationsService from './informationsService.js';
import { ErreurDureeValiditeInvalide, ErreurAvisInvalide } from '../erreurs.js';
import { Referentiel } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';
import {
  IdEcheanceRenouvellement,
  IdStatutHomologation,
} from '../referentiel.types.js';

export type DonneesAvis = {
  statut: IdStatutHomologation;
  dureeValidite: IdEcheanceRenouvellement;
  commentaires?: string;
  collaborateurs: string[];
};

class Avis extends InformationsService {
  private readonly statut!:
    | 'favorable'
    | 'favorableAvecReserve'
    | 'defavorable';
  private readonly dureeValidite!: 'sixMois' | 'unAn' | 'deuxAns' | 'troisAns';
  private readonly commentaires?: string;
  private readonly collaborateurs!: string[];

  constructor(
    donnees: Partial<DonneesAvis> = {},
    referentiel: Referentiel = creeReferentielVide()
  ) {
    super({
      proprietesAtomiquesRequises: Avis.proprietesAtomiquesRequises(),
      proprietesAtomiquesFacultatives: Avis.proprietesAtomiquesFacultatives(),
      proprietesListes: Avis.proprietesListes(),
    });

    Avis.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);
  }

  static proprietesAtomiquesRequises() {
    return ['statut', 'dureeValidite'];
  }

  static proprietesAtomiquesFacultatives() {
    return ['commentaires'];
  }

  static proprietesListes() {
    return ['collaborateurs'];
  }

  static valide(
    { dureeValidite, statut }: Partial<DonneesAvis>,
    referentiel: Referentiel
  ) {
    if (!referentiel.estIdentifiantEcheanceRenouvellementConnu(dureeValidite)) {
      throw new ErreurDureeValiditeInvalide(
        `La durée de validité "${dureeValidite}" est invalide`
      );
    }
    if (!referentiel.estIdentifiantStatutAvisDossierHomologationConnu(statut)) {
      throw new ErreurAvisInvalide(`L'avis "${statut}" est invalide`);
    }
  }

  statutSaisie() {
    const statutSaisieProprietesAtomiques = super.statutSaisie();
    const collaborateursSaisis =
      this.collaborateurs.length > 0 && this.collaborateurs.every((c) => !!c);
    switch (statutSaisieProprietesAtomiques) {
      case InformationsService.COMPLETES:
        return collaborateursSaisis
          ? InformationsService.COMPLETES
          : InformationsService.A_COMPLETER;
      case InformationsService.A_SAISIR:
        return collaborateursSaisis
          ? InformationsService.A_COMPLETER
          : InformationsService.A_SAISIR;
      default:
        return InformationsService.A_COMPLETER;
    }
  }
}

export default Avis;
