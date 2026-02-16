import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { Gravite } from './graviteObjectifsVises.js';

export type ConfigurationRisqueV2 = Record<
  IdVecteurRisque,
  {
    intitule: string;
    intitulesObjectifsVises: Partial<Record<IdObjectifVise, string>>;
  }
>;

export class RisqueV2 {
  gravite: Gravite;
  intitule: string;

  constructor(
    private readonly idVecteur: IdVecteurRisque,
    private readonly objectifsVises: Partial<Record<IdObjectifVise, Gravite>>,
    private readonly configuration: ConfigurationRisqueV2
  ) {
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
