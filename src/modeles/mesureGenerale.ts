import Mesure from './mesure.js';
import { ErreurMesureInconnue } from '../erreurs.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import type {
  IdMesure,
  PrioriteMesure,
  StatutMesure,
} from '../../referentiel.types.js';
import type { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';
import { UUID } from '../typesBasiques.js';

type DonneesMesureGenerale = {
  id: IdMesure | IdMesureV2;
  statut: StatutMesure;
  modalites?: string;
  priorite?: PrioriteMesure;
  echeance?: string;
  responsables?: UUID[];
  rendueIndispensable?: boolean;
};

class MesureGenerale extends Mesure {
  readonly id!: IdMesure | IdMesureV2;
  readonly statut!: StatutMesure;
  responsables!: string[];
  readonly modalites?: string;
  readonly priorite?: PrioriteMesure;
  readonly echeance?: Date | '';
  readonly rendueIndispensable: boolean;
  private readonly referentiel: Referentiel | ReferentielV2;

  constructor(
    donneesMesure: DonneesMesureGenerale,
    referentiel: Referentiel | ReferentielV2
  ) {
    super({
      proprietesAtomiquesRequises: ['id', 'statut'],
      proprietesAtomiquesFacultatives: ['modalites', 'priorite', 'echeance'],
      proprietesListes: ['responsables'],
    });

    MesureGenerale.valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure, referentiel);

    this.rendueIndispensable = !!donneesMesure.rendueIndispensable;
    this.referentiel = referentiel;
    this.echeance = donneesMesure.echeance
      ? new Date(donneesMesure.echeance)
      : '';
  }

  donneesReferentiel() {
    return this.referentiel.mesure(this.id);
  }

  descriptionMesure() {
    return this.donneesReferentiel().description;
  }

  estIndispensable() {
    return (
      !!this.donneesReferentiel().indispensable || this.rendueIndispensable
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

  static valide(
    { id, statut, priorite, echeance }: DonneesMesureGenerale,
    referentiel: Referentiel | ReferentielV2
  ) {
    super.valide({ statut, priorite, echeance }, referentiel);

    if (!referentiel.estIdentifiantMesureConnu(id)) {
      throw new ErreurMesureInconnue(`La mesure "${id}" n'est pas répertoriée`);
    }
  }
}

export default MesureGenerale;
