class PartiesPrenantes {
  constructor(donneesPartiesPrenantes = {}) {
    const {
      autoriteHomologation,
      fonctionAutoriteHomologation,
      piloteProjet,
      expertCybersecurite,
    } = donneesPartiesPrenantes;

    this.autoriteHomologation = autoriteHomologation;
    this.fonctionAutoriteHomologation = fonctionAutoriteHomologation;
    this.piloteProjet = piloteProjet;
    this.expertCybersecurite = expertCybersecurite;
  }

  toJSON() {
    const resultat = {};
    ['autoriteHomologation', 'fonctionAutoriteHomologation', 'piloteProjet', 'expertCybersecurite']
      .filter((k) => this[k])
      .forEach((k) => (resultat[k] = this[k]));

    return resultat;
  }
}

module.exports = PartiesPrenantes;
