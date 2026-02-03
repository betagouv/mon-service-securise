import Mesure from './mesure.js';
import {
  ErreurCategorieInconnue,
  ErreurDetachementModeleMesureSpecifiqueImpossible,
} from '../erreurs.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import { UUID } from '../typesBasiques.js';
import type {
  CategorieMesure,
  PrioriteMesure,
  StatutMesure,
} from '../../referentiel.types.js';

export type DonneesMesureSpecifique = {
  id: UUID;
  description: string;
  categorie: CategorieMesure;
  statut: StatutMesure;
  modalites?: string;
  priorite?: PrioriteMesure;
  echeance?: string;
  descriptionLongue?: string;
  idModele?: UUID;
  responsables?: UUID[];
};

type DonneesMesureSpecifiqueSerialisees = {
  id: UUID;
  description?: string;
  categorie?: CategorieMesure;
  statut: StatutMesure;
  modalites?: string;
  priorite?: PrioriteMesure;
  echeance?: string;
  descriptionLongue?: string;
  idModele?: UUID;
  responsables: UUID[];
};

class MesureSpecifique extends Mesure {
  readonly id!: UUID;
  readonly description!: string;
  readonly categorie!: CategorieMesure;
  readonly statut!: StatutMesure;
  readonly modalites?: string;
  readonly priorite?: PrioriteMesure;
  readonly echeance?: Date | '';
  readonly descriptionLongue?: string;
  idModele?: UUID;
  responsables!: UUID[];
  private readonly referentiel: Referentiel | ReferentielV2;

  constructor(
    donneesMesure: DonneesMesureSpecifique,
    referentiel: Referentiel | ReferentielV2
  ) {
    super({
      proprietesAtomiquesRequises: MesureSpecifique.proprietesObligatoires(),
      proprietesAtomiquesFacultatives: [
        'modalites',
        'priorite',
        'echeance',
        'descriptionLongue',
        'idModele',
      ],
      proprietesListes: ['responsables'],
    });

    MesureSpecifique.valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure, referentiel);

    this.referentiel = referentiel;
    this.echeance = donneesMesure.echeance
      ? new Date(donneesMesure.echeance)
      : '';
  }

  descriptionMesure() {
    return this.description;
  }

  statutRenseigne() {
    return Mesure.statutRenseigne(this.statut);
  }

  donneesSerialisees(): DonneesMesureSpecifiqueSerialisees {
    const toutesDonnees =
      super.donneesSerialisees() as DonneesMesureSpecifiqueSerialisees;

    const lieeAUnModele = toutesDonnees.idModele;
    if (lieeAUnModele) {
      delete toutesDonnees.description;
      delete toutesDonnees.descriptionLongue;
      delete toutesDonnees.categorie;
    }

    return {
      ...toutesDonnees,
      ...(this.echeance && { echeance: new Date(this.echeance).toISOString() }),
    };
  }

  supprimeResponsable(idUtilisateur: UUID) {
    this.responsables = this.responsables.filter((r) => r !== idUtilisateur);
  }

  detacheDeSonModele() {
    if (!this.idModele)
      throw new ErreurDetachementModeleMesureSpecifiqueImpossible(
        `Impossible de détacher la mesure '${this.id}' : elle n'est pas reliée à un modèle.`
      );

    delete this.idModele;
  }

  static proprietesObligatoires() {
    return ['id', 'description', 'categorie', 'statut'];
  }

  static valide(
    { categorie, statut, priorite, echeance }: DonneesMesureSpecifique,
    referentiel: Referentiel | ReferentielV2
  ) {
    super.valide({ statut, priorite, echeance }, referentiel);

    const identifiantsCategoriesMesures =
      referentiel.identifiantsCategoriesMesures();
    if (categorie && !identifiantsCategoriesMesures.includes(categorie)) {
      throw new ErreurCategorieInconnue(
        `La catégorie "${categorie}" n'est pas répertoriée`
      );
    }
  }
}

export default MesureSpecifique;
