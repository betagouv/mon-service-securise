const Regles = require('./regles');
const Mesures = require('./mesures');

class Profil {
  constructor(regles, mesures) {
    this.regles = new Regles(regles);
    this.mesures = new Mesures(mesures);
  }

  estProfil(cles) {
    return this.regles.presence.every((cle) => cles.includes(cle))
    && this.regles.absence.every((cle) => !cles.includes(cle));
  }

  mesuresACibler(cles, action) {
    return this.estProfil(cles) ? this.mesures[action] : [];
  }

  mesuresAAjouter(cles) {
    return this.mesuresACibler(cles, 'ajouter');
  }

  mesuresARetirer(cles) {
    return this.mesuresACibler(cles, 'retirer');
  }
}

module.exports = Profil;
