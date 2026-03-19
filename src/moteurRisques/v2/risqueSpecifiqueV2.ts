import { CategorieRisque } from './risquesV2.types.js';
import { Vraisemblance } from './vraisemblance/vraisemblance.types.js';
import { Gravite } from './graviteObjectifsVises.js';
import { UUID } from '../../typesBasiques.js';

export type DonneesRisqueSpecifiqueV2 = {
  id: UUID;
  intitule: string;
  description?: string;
  categories: CategorieRisque[];
  risqueBrut: { gravite: Gravite; vraisemblance: Vraisemblance };
  gravite: Gravite;
  vraisemblance: Vraisemblance;
  commentaire?: string;
};

export type DonneesMiseAJourRisqueSpecifiqueV2 = Omit<
  DonneesRisqueSpecifiqueV2,
  'id'
>;

export class RisqueSpecifiqueV2 {
  readonly id: UUID;
  private intitule: string;
  private description?: string;
  private categories: CategorieRisque[];
  private risqueBrut: {
    gravite: Gravite;
    vraisemblance: Vraisemblance;
  };
  private gravite: Gravite;
  private vraisemblance: Vraisemblance;
  private commentaire?: string;

  constructor(donnees: DonneesRisqueSpecifiqueV2) {
    this.id = donnees.id;
    this.intitule = donnees.intitule;
    this.description = donnees.description;
    this.categories = donnees.categories;
    this.risqueBrut = donnees.risqueBrut;
    this.gravite = donnees.gravite;
    this.vraisemblance = donnees.vraisemblance;
    this.commentaire = donnees.commentaire;
  }

  toJSON() {
    return {
      id: this.id,
      intitule: this.intitule,
      description: this.description,
      categories: this.categories,
      risqueBrut: this.risqueBrut,
      gravite: this.gravite,
      vraisemblance: this.vraisemblance,
      commentaire: this.commentaire,
    };
  }

  donneesSerialisees() {
    return {
      id: this.id,
      intitule: this.intitule,
      description: this.description,
      categories: this.categories,
      risqueBrut: this.risqueBrut,
      gravite: this.gravite,
      vraisemblance: this.vraisemblance,
      commentaire: this.commentaire,
    };
  }

  metsAJour(donnees: DonneesMiseAJourRisqueSpecifiqueV2) {
    this.intitule = donnees.intitule;
    this.description = donnees.description;
    this.categories = donnees.categories;
    this.risqueBrut = donnees.risqueBrut;
    this.gravite = donnees.gravite;
    this.vraisemblance = donnees.vraisemblance;
    this.commentaire = donnees.commentaire;
  }
}
