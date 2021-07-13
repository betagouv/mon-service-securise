const descriptionPartiePrenante = (partiePrenante, fonction) => {
  const description = [];
  if (partiePrenante) {
    description.push(partiePrenante);
    description.push(fonction ? `(${fonction})` : '(fonction non renseignée)');
  }

  return description.length === 0 ? 'Information non renseignée' : description.join(' ');
};

class PartiesPrenantes {
  constructor(donneesPartiesPrenantes = {}) {
    const {
      autoriteHomologation,
      fonctionAutoriteHomologation,
      piloteProjet,
      fonctionPiloteProjet,
      expertCybersecurite,
      fonctionExpertCybersecurite,
    } = donneesPartiesPrenantes;

    this.autoriteHomologation = autoriteHomologation;
    this.fonctionAutoriteHomologation = fonctionAutoriteHomologation;
    this.piloteProjet = piloteProjet;
    this.fonctionPiloteProjet = fonctionPiloteProjet;
    this.expertCybersecurite = expertCybersecurite;
    this.fonctionExpertCybersecurite = fonctionExpertCybersecurite;
  }

  descriptionEquipePreparation() {
    const membresEquipe = [];
    if (this.piloteProjet) membresEquipe.push(this.descriptionPiloteProjet());
    if (this.expertCybersecurite) membresEquipe.push(this.descriptionExpertCybersecurite());

    return membresEquipe.length === 0 ? 'Information non renseignée' : membresEquipe.join(', ');
  }

  descriptionAutoriteHomologation() {
    return descriptionPartiePrenante(this.autoriteHomologation, this.fonctionAutoriteHomologation);
  }

  descriptionPiloteProjet() {
    return descriptionPartiePrenante(this.piloteProjet, this.fonctionPiloteProjet);
  }

  descriptionExpertCybersecurite() {
    return descriptionPartiePrenante(this.expertCybersecurite, this.fonctionExpertCybersecurite);
  }

  toJSON() {
    const resultat = {};
    [
      'autoriteHomologation', 'fonctionAutoriteHomologation',
      'piloteProjet', 'fonctionPiloteProjet',
      'expertCybersecurite', 'fonctionExpertCybersecurite',
    ].filter((k) => this[k])
      .forEach((k) => (resultat[k] = this[k]));

    return resultat;
  }
}

module.exports = PartiesPrenantes;
