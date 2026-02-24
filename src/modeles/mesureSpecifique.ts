import Mesure from './mesure.js';
import {
  ErreurCategorieInconnue,
  ErreurDetachementModeleMesureSpecifiqueImpossible,
} from '../erreurs.js';
import { creeReferentielVide } from '../referentiel.js';
import { Referentiel } from '../referentiel.interface.js';
import { UUID } from '../typesBasiques.js';

export type DonneesMesureSpecifique = {
  id: UUID;
  description: string;
  categorie: string;
  statut: string;
  modalites?: string;
  priorite?: string;
  echeance?: string;
  descriptionLongue?: string;
  idModele?: UUID;
  responsables?: Array<UUID>;
};

class MesureSpecifique extends Mesure {
  readonly id!: UUID;
  idModele?: UUID;
  readonly description!: string;
  readonly descriptionLongue?: string;
  readonly categorie!: string;
  readonly echeance?: Date;
  readonly modalites?: string;
  readonly priorite?: string;
  readonly statut!: string;
  responsables!: Array<UUID>;

  static proprietesObligatoires() {
    return ['id', 'description', 'categorie', 'statut'];
  }

  constructor(
    donneesMesure: Partial<DonneesMesureSpecifique> = {},
    referentiel: Referentiel = creeReferentielVide()
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
    this.renseigneProprietes(donneesMesure);

    this.referentiel = referentiel;

    if (donneesMesure.echeance)
      this.echeance = new Date(donneesMesure.echeance);
  }

  descriptionMesure() {
    return this.description;
  }

  statutRenseigne() {
    return Mesure.statutRenseigne(this.statut);
  }

  donneesSerialisees(): Record<string, unknown> {
    const toutesDonnees = super.donneesSerialisees() as Record<string, unknown>;

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

  static valide(
    {
      categorie,
      statut,
      priorite,
      echeance,
    }: {
      categorie?: string;
      statut?: string;
      priorite?: string;
      echeance?: string;
    },
    referentiel: Referentiel
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
