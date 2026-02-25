import InformationsService from './informationsService.js';
import NiveauGravite, { IdNiveauGravite } from './niveauGravite.js';
import { ErreurNiveauVraisemblanceInconnu } from '../erreurs.js';
import { Referentiel } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';

type NiveauVraisemblance =
  | 'invraisemblable'
  | 'peuVraisemblable'
  | 'vraisemblable'
  | 'tresVraisemblable'
  | 'quasiCertain';

export type DonneesRisque = {
  id: string;
  niveauGravite: string;
  niveauVraisemblance: NiveauVraisemblance;
  commentaire?: string;
};

class Risque extends InformationsService {
  readonly id!: string;
  readonly niveauGravite!: IdNiveauGravite;
  readonly niveauVraisemblance!: NiveauVraisemblance;
  readonly commentaire?: string;
  private readonly objetNiveauGravite: NiveauGravite;
  readonly referentiel: Referentiel;

  constructor(
    donneesRisque: Partial<DonneesRisque> = {},
    referentiel: Referentiel = creeReferentielVide()
  ) {
    super({
      proprietesAtomiquesRequises: [
        'id',
        'niveauGravite',
        'niveauVraisemblance',
      ],
      proprietesAtomiquesFacultatives: ['commentaire'],
    });

    this.renseigneProprietes(donneesRisque);
    this.objetNiveauGravite = new NiveauGravite(
      this.niveauGravite,
      referentiel
    );
    this.referentiel = referentiel;
  }

  descriptionNiveauGravite() {
    return this.objetNiveauGravite.descriptionNiveau();
  }

  important() {
    return this.objetNiveauGravite.niveauImportant();
  }

  positionNiveauGravite() {
    return this.objetNiveauGravite.position;
  }

  niveauRisque() {
    if (!this.niveauVraisemblance || !this.niveauGravite) {
      return Risque.NIVEAU_RISQUE_INDETERMINABLE;
    }
    return this.referentiel.niveauRisque(
      this.niveauVraisemblance,
      this.niveauGravite
    );
  }

  static valide(
    { niveauVraisemblance }: { niveauVraisemblance?: string },
    referentiel: Referentiel
  ) {
    const identifiantsNiveauxVraisemblance =
      referentiel.identifiantsNiveauxVraisemblance();
    if (
      niveauVraisemblance &&
      !identifiantsNiveauxVraisemblance.includes(niveauVraisemblance)
    ) {
      throw new ErreurNiveauVraisemblanceInconnu(
        `Le niveau de vraisemblance "${niveauVraisemblance}" n'est pas répertorié`
      );
    }
  }

  static NIVEAU_RISQUE_INDETERMINABLE = 'indeterminable';
}

export default Risque;
