import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { Gravite } from './graviteObjectifsVises.js';
import { configurationRisqueV2 } from './risqueV2.configuration.js';
import { Vraisemblance } from './vraisemblance/vraisemblance.types.js';
import {
  CategorieRisque,
  ConfigurationRisqueV2,
  IdRisqueV2,
} from './risquesV2.types.js';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';

const ovVersCategories = new Map<IdObjectifVise, CategorieRisque[]>([
  ['OV1', ['integrite']],
  ['OV2', ['confidentialite', 'integrite']],
  ['OV3', ['disponibilite']],
  ['OV4', ['integrite']],
]);

export type ModificationManuelleRisqueV2 = {
  desactive?: boolean;
  commentaire?: string;
  graviteSurchargee?: Gravite;
};

export type JSONRisqueV2 = {
  id: IdRisqueV2;
  intitule: string;
  description: string;
  exemple: string;
  gravite: Gravite;
  graviteCalculee: Gravite;
  vraisemblance: Vraisemblance;
  categories: Array<CategorieRisque>;
  desactive?: boolean;
  commentaire?: string;
  mesuresAssociees: Array<IdMesureV2>;
};

export class RisqueV2 {
  readonly id: IdRisqueV2;
  readonly intitule: string;
  readonly description: string;
  readonly exemple: string;
  readonly categories: Array<CategorieRisque>;
  private desactive?: boolean;
  private commentaire?: string;
  private readonly graviteCalculee: Gravite;
  private graviteSurchargee?: Gravite;

  constructor(
    private readonly idVecteur: IdVecteurRisque,
    private readonly objectifsVises: Partial<Record<IdObjectifVise, Gravite>>,
    public readonly vraisemblance: Vraisemblance,
    private readonly idsMesuresAssociees: Array<IdMesureV2>,
    donnees: ModificationManuelleRisqueV2 = {},
    private readonly configuration: ConfigurationRisqueV2 = configurationRisqueV2
  ) {
    this.id = RisqueV2.idPourVecteur(idVecteur);
    this.graviteCalculee = Math.max(
      ...Object.values(objectifsVises)
    ) as Gravite;
    this.intitule = this.genereIntitule();
    this.description = this.configuration[idVecteur].description;
    this.exemple = this.configuration[idVecteur].exemple;
    this.categories = this.getCategories();
    this.desactive = donnees.desactive;
    this.commentaire = donnees.commentaire;
    this.graviteSurchargee = donnees.graviteSurchargee;
  }

  public get gravite(): Gravite {
    return this.graviteSurchargee ?? this.graviteCalculee;
  }

  toJSON(): JSONRisqueV2 {
    return {
      id: this.id,
      intitule: this.intitule,
      description: this.description,
      exemple: this.exemple,
      gravite: this.gravite,
      graviteCalculee: this.graviteCalculee,
      vraisemblance: this.vraisemblance,
      categories: this.categories,
      desactive: this.desactive,
      commentaire: this.commentaire,
      mesuresAssociees: this.idsMesuresAssociees,
    };
  }

  private genereIntitule(): string {
    const formatteurListe = new Intl.ListFormat('fr', {
      style: 'long',
      type: 'conjunction',
    });

    const vecteur = this.configuration[this.idVecteur];
    const idsOV = Object.keys(this.objectifsVises) as IdObjectifVise[];
    const intitulesOv = formatteurListe.format(
      idsOV.map((id) => vecteur.intitulesObjectifsVises[id]!)
    );

    return `${vecteur.intitule} ${intitulesOv}`;
  }

  private getCategories(): CategorieRisque[] {
    return [
      ...new Set(
        Object.keys(this.objectifsVises).flatMap(
          (ov) =>
            ovVersCategories.get(ov as IdObjectifVise) as CategorieRisque[]
        )
      ),
    ];
  }

  static idPourVecteur(idVecteur: IdVecteurRisque): IdRisqueV2 {
    return idVecteur.replace('V', 'R') as IdRisqueV2;
  }

  donneesSerialisees(): ModificationManuelleRisqueV2 {
    return {
      desactive: this.desactive,
      commentaire: this.commentaire,
      graviteSurchargee: this.graviteSurchargee,
    };
  }

  metsAJour(donnees: ModificationManuelleRisqueV2) {
    this.desactive = donnees.desactive;
    this.commentaire = donnees.commentaire;
    this.graviteSurchargee = donnees.graviteSurchargee;
  }
}
