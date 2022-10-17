const Regles = require('./regles');
const Mesures = require('./mesures');

const estConforme = (cles, regle) => regle.presence.every((cle) => cles.includes(cle))
  && regle.absence.every((cle) => !cles.includes(cle));

class Profil {
  constructor(regles, mesures) {
    this.regles = new Regles(regles);
    this.mesures = new Mesures(mesures);
  }

  estProfil(cles) {
    return this.regles.sontVides()
    || this.regles.toutes()
      .map((regle) => estConforme(cles, regle))
      .reduce((accumulateur, courant) => accumulateur || courant, false);
  }

  mesuresACibler(cles, action) {
    return this.estProfil(cles) ? this.mesures[action] : [];
  }

  mesuresAAjouter(cles) {
    return this.mesuresACibler(cles, 'ajouter');
  }

  mesuresARendreIndispensables(cles) {
    return this.mesuresACibler(cles, 'rendreIndispensables');
  }

  mesuresARetirer(cles) {
    return this.mesuresACibler(cles, 'retirer');
  }
}

module.exports = Profil;
