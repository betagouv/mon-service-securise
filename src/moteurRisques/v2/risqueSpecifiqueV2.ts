import { CategorieRisque } from './risquesV2.types.js';
import { Vraisemblance } from './vraisemblance/vraisemblance.types.js';
import { Gravite } from './graviteObjectifsVises.js';

type DonneesRisqueSpecifiqueV2 = {
  intitule: string;
  description?: string;
  categories: CategorieRisque[];
  risqueBrut: { gravite: Gravite; vraisemblance: Vraisemblance };
  gravite: Gravite;
  vraisemblance: Vraisemblance;
  commentaire?: string;
};

export class RisqueSpecifiqueV2 {
  private readonly intitule: string;
  private readonly description?: string;
  private readonly categories: CategorieRisque[];
  private readonly risqueBrut: {
    gravite: Gravite;
    vraisemblance: Vraisemblance;
  };
  private readonly gravite: Gravite;
  private readonly vraisemblance: Vraisemblance;
  private readonly commentaire?: string;

  constructor(donnees: DonneesRisqueSpecifiqueV2) {
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
      intitule: this.intitule,
      description: this.description,
      categories: this.categories,
      risqueBrut: this.risqueBrut,
      gravite: this.gravite,
      vraisemblance: this.vraisemblance,
      commentaire: this.commentaire,
    };
  }
}
