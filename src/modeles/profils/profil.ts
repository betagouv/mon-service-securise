import Regles from './regles.js';
import Mesures, { DonneesMesures } from './mesures.js';
import Regle, { DonneesRegle } from './regle.js';
import { CritereRegle } from '../../referentiel.types.js';

const estConforme = (cles: CritereRegle[], regle: Regle) =>
  regle.presence.every((cle) => cles.includes(cle)) &&
  regle.absence.every((cle) => !cles.includes(cle));

class Profil {
  private readonly regles: Regles;
  private readonly mesures: Mesures;

  constructor(regles: DonneesRegle[], mesures: Partial<DonneesMesures>) {
    this.regles = new Regles(regles);
    this.mesures = new Mesures(mesures);
  }

  estProfil(cles: CritereRegle[]) {
    return (
      this.regles.sontVides() ||
      this.regles
        .toutes()
        .map((regle) => estConforme(cles, regle))
        .reduce((accumulateur, courant) => accumulateur || courant, false)
    );
  }

  mesuresACibler(cles: CritereRegle[], action: keyof typeof Mesures.prototype) {
    return this.estProfil(cles) ? this.mesures[action] : [];
  }

  mesuresAAjouter(cles: CritereRegle[]) {
    return this.mesuresACibler(cles, 'ajouter');
  }

  mesuresARendreIndispensables(cles: CritereRegle[]) {
    return this.mesuresACibler(cles, 'rendreIndispensables');
  }

  mesuresARetirer(cles: CritereRegle[]) {
    return this.mesuresACibler(cles, 'retirer');
  }
}

export default Profil;
