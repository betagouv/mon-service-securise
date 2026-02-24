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

export class RisqueV2 {
  id: IdRisqueV2;
  gravite: Gravite;
  intitule: string;

  constructor(
    private readonly idVecteur: IdVecteurRisque,
    private readonly objectifsVises: Partial<Record<IdObjectifVise, Gravite>>,
    public readonly vraisemblance: Vraisemblance,
    private readonly configuration: ConfigurationRisqueV2 = configurationRisqueV2
  ) {
    this.id = idVecteur.replace('V', 'R') as IdRisqueV2;
    this.gravite = Math.max(...Object.values(objectifsVises)) as Gravite;
    this.intitule = this.genereIntitule();
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
}
