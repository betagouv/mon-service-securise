import Mesure from './mesure.js';
import { ErreurMesureInconnue } from '../erreurs.js';
import { IdStatutMesure } from '../referentiel.types.js';
import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';
import { TousReferentiels } from '../referentiel.interface.js';
import { UUID } from '../typesBasiques.js';
import { DonneesMesureGenerale } from './mesureGenerale.type.js';

class MesureGenerale<TVersion extends IdMesureV1 | IdMesureV2> extends Mesure {
  readonly id!: TVersion;
  readonly statut!: IdStatutMesure;
  readonly modalites?: string;
  readonly priorite?: string;
  readonly echeance?: Date;
  readonly rendueIndispensable?: boolean;
  responsables!: UUID[];
  private readonly referentiel: TousReferentiels;

  constructor(
    donneesMesure: Partial<DonneesMesureGenerale<TVersion>>,
    referentiel: TousReferentiels
  ) {
    super({
      proprietesAtomiquesRequises: ['id', 'statut'],
      proprietesAtomiquesFacultatives: ['modalites', 'priorite', 'echeance'],
      proprietesListes: ['responsables'],
    });

    MesureGenerale.valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure);

    this.rendueIndispensable = !!donneesMesure.rendueIndispensable;
    this.referentiel = referentiel;
    if (donneesMesure.echeance)
      this.echeance = new Date(donneesMesure.echeance);
  }

  donneesReferentiel() {
    return this.referentiel.mesure(this.id as IdMesureV1 & IdMesureV2);
  }

  descriptionMesure() {
    return this.donneesReferentiel().description;
  }

  estIndispensable() {
    return (
      !!this.donneesReferentiel().indispensable ||
      this.rendueIndispensable ||
      false
    );
  }

  estRecommandee() {
    return !this.estIndispensable();
  }

  statutRenseigne() {
    return Mesure.statutRenseigne(this.statut);
  }

  supprimeResponsable(idUtilisateur: UUID) {
    this.responsables = this.responsables.filter((r) => r !== idUtilisateur);
  }

  donneesSerialisees() {
    return {
      ...super.donneesSerialisees(),
      ...(this.echeance && { echeance: new Date(this.echeance).toISOString() }),
    };
  }

  static valide<TVersion extends IdMesureV1 | IdMesureV2>(
    {
      id,
      statut,
      priorite,
      echeance,
    }: Partial<DonneesMesureGenerale<TVersion>>,
    referentiel: TousReferentiels
  ) {
    super.valide({ statut, priorite, echeance }, referentiel);

    if (!referentiel.estIdentifiantMesureConnu(id as IdMesureV1 & IdMesureV2)) {
      throw new ErreurMesureInconnue(`La mesure "${id}" n'est pas répertoriée`);
    }
  }
}

export default MesureGenerale;
