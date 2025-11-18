import Etape from './etape.js';

export type DonneeEtapeAutorite = {
  nom?: string;
  fonction?: string;
};

class Autorite extends Etape {
  constructor({ nom, fonction }: DonneeEtapeAutorite = {}) {
    super({ proprietesAtomiquesRequises: ['nom', 'fonction'] });
    // @ts-expect-error On omet le référentiel car aucun `listesAgregats` présent
    this.renseigneProprietes({ nom, fonction });
  }

  enregistreAutoriteHomologation(nom: string, fonction: string) {
    this.nom = nom;
    this.fonction = fonction;
  }

  estComplete() {
    return !!(this.nom && this.fonction);
  }
}

export default Autorite;
