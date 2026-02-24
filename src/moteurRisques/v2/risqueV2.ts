import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { Gravite } from './graviteObjectifsVises.js';
import { configurationRisqueV2 } from './risqueV2.configuration.js';
import { Vraisemblance } from './vraisemblance/vraisemblance.types.js';

export type ConfigurationRisqueV2 = Record<
  IdVecteurRisque,
  {
    intitule: string;
    intitulesObjectifsVises: Partial<Record<IdObjectifVise, string>>;
  }
>;

export type IdRisqueV2 = `R${
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14}`;

type CategorieRisque =
  | 'disponibilite'
  | 'integrite'
  | 'confidentialite'
  | 'tracabilite';

const ovVersCategories = new Map<IdObjectifVise, CategorieRisque[]>([
  ['OV1', ['integrite']],
  ['OV2', ['confidentialite', 'integrite']],
  ['OV3', ['disponibilite']],
  ['OV4', ['integrite']],
]);

export class RisqueV2 {
  readonly id: IdRisqueV2;
  readonly gravite: Gravite;
  readonly intitule: string;
  readonly categories: Array<CategorieRisque>;

  constructor(
    private readonly idVecteur: IdVecteurRisque,
    private readonly objectifsVises: Partial<Record<IdObjectifVise, Gravite>>,
    public readonly vraisemblance: Vraisemblance,
    private readonly configuration: ConfigurationRisqueV2 = configurationRisqueV2
  ) {
    this.id = idVecteur.replace('V', 'R') as IdRisqueV2;
    this.gravite = Math.max(...Object.values(objectifsVises)) as Gravite;
    this.intitule = this.genereIntitule();
    this.categories = this.getCategories();
  }

  private genereIntitule() {
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

  private getCategories() {
    return [
      ...new Set(
        Object.keys(this.objectifsVises).flatMap(
          (ov) =>
            ovVersCategories.get(ov as IdObjectifVise) as CategorieRisque[]
        )
      ),
    ];
  }
}
