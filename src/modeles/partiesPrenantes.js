const InformationsHomologation = require('./informationsHomologation');

const descriptionPartiePrenante = (partiePrenante, fonction) => {
  const description = [];
  if (partiePrenante) {
    description.push(partiePrenante);
    description.push(fonction ? `(${fonction})` : '(fonction non renseignée)');
  }

  return description.length === 0 ? 'Information non renseignée' : description.join(' ');
};

class PartiesPrenantes extends InformationsHomologation {
  constructor(donneesPartiesPrenantes = {}) {
    super({
      proprietesAtomiques: [
        'autoriteHomologation',
        'fonctionAutoriteHomologation',
        'piloteProjet',
        'fonctionPiloteProjet',
        'expertCybersecurite',
        'fonctionExpertCybersecurite',
      ],
    });

    this.renseigneProprietes(donneesPartiesPrenantes);
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
}

module.exports = PartiesPrenantes;
