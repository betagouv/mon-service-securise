const ActeursHomologation = require('./acteursHomologation');
const InformationsHomologation = require('./informationsHomologation');
const PartiesPrenantes = require('./partiesPrenantes/partiesPrenantes');

const descriptionRole = (nomPrenom, fonction) => {
  const description = [];
  if (nomPrenom) {
    description.push(nomPrenom);
    description.push(fonction ? `(${fonction})` : '(fonction non renseignée)');
  }

  return description.length === 0
    ? 'Information non renseignée'
    : description.join(' ');
};

class RolesResponsabilites extends InformationsHomologation {
  constructor(donneesRolesResponsabilites = {}) {
    super({
      proprietesAtomiquesRequises: [
        'autoriteHomologation',
        'fonctionAutoriteHomologation',
        'delegueProtectionDonnees',
        'fonctionDelegueProtectionDonnees',
        'piloteProjet',
        'fonctionPiloteProjet',
        'expertCybersecurite',
        'fonctionExpertCybersecurite',
      ],
      listesAgregats: {
        acteursHomologation: ActeursHomologation,
        partiesPrenantes: PartiesPrenantes,
      },
    });

    this.renseigneProprietes(donneesRolesResponsabilites);
  }

  descriptionDelegueProtectionDonnees() {
    return descriptionRole(
      this.delegueProtectionDonnees,
      this.fonctionDelegueProtectionDonnees
    );
  }

  descriptionHebergeur() {
    return (
      this.partiesPrenantes.hebergement()?.nom || 'Hébergeur non renseigné'
    );
  }

  descriptionStructureDeveloppement() {
    return this.partiesPrenantes.developpementFourniture()?.nom || '';
  }
}

module.exports = RolesResponsabilites;
