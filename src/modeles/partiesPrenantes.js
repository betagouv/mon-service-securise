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

  descriptionEquipePreparation() {
    const membresEquipe = [];
    if (this.piloteProjet) membresEquipe.push(`${this.piloteProjet} (responsable du projet)`);
    if (this.expertCybersecurite) {
      membresEquipe.push(`${this.expertCybersecurite} (expert cybersécurité)`);
    }

    return membresEquipe.length === 0 ? 'Information non renseignée' : membresEquipe.join(', ');
  }

  descriptionAutoriteHomologation() {
    const description = [];
    if (this.autoriteHomologation) {
      description.push(`${this.autoriteHomologation}`);
      description.push(this.fonctionAutoriteHomologation
        ? `(${this.fonctionAutoriteHomologation})`
        : '(fonction non renseignée)');
    }

    return description.length === 0 ? 'Information non renseignée' : description.join(' ');
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
