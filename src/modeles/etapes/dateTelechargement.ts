import Etape from './etape.js';

export type DonneeEtapeDateTelechargement = {
  date?: string;
};

class DateTelechargement extends Etape {
  constructor(donnees: DonneeEtapeDateTelechargement = {}) {
    super({ proprietesAtomiquesRequises: ['date'] });
    // @ts-expect-error On omet le référentiel car aucun `listesAgregats` présent
    this.renseigneProprietes(donnees);
  }

  estComplete() {
    return this.date !== undefined;
  }

  enregistreDateTelechargement(date: string) {
    this.date = date;
  }

  toJSON() {
    return { date: this.date };
  }
}

export default DateTelechargement;
