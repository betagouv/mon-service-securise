import ElementsConstructibles from './elementsConstructibles.js';
import { ErreurRisqueInconnu } from '../erreurs.js';
import Risque from './risque.js';
import { IdNiveauGravite } from './niveauGravite.js';

class ListeRisques<T extends Risque> extends ElementsConstructibles<T> {
  principaux() {
    return this.items.filter((risque) => risque.important());
  }

  parNiveauGravite(accumulateur = {}) {
    return this.tous().reduce(
      (acc, risque) => {
        // eslint-disable-next-line no-param-reassign
        acc[risque.niveauGravite] ||= [];
        acc[risque.niveauGravite].push(risque.toJSON());
        return acc;
      },
      accumulateur as Record<IdNiveauGravite, Array<object>>
    );
  }

  ajouteRisque(risque: T) {
    this.items.push(risque);
  }

  supprimeRisque(idRisque: string) {
    this.items = this.items.filter((r) => r.id !== idRisque);
  }

  trouveIndex(idRisque: string) {
    const index = this.items.findIndex((r) => r.id === idRisque);
    if (index === -1)
      throw new ErreurRisqueInconnu(`Le risque "${idRisque}" est introuvable.`);
    return index;
  }

  trouveParId(idRisque: string) {
    return this.items[this.trouveIndex(idRisque)];
  }

  metsAJourRisque(risque: T) {
    const index = this.trouveIndex(risque.id);
    this.items[index] = risque;
  }
}

export default ListeRisques;
