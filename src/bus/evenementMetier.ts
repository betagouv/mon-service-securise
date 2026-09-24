import { verifieProprietesRenseignees } from '../utilitaires/proprietesRequises.js';

const EvenementMetier = <Donnees extends object>(
  proprietesRequises: (keyof Donnees)[]
) =>
  class {
    constructor(donnees: Donnees) {
      verifieProprietesRenseignees(donnees, proprietesRequises);
      Object.assign(this, donnees);
    }
  } as new (donnees: Donnees) => Readonly<Donnees>;

export { EvenementMetier };
