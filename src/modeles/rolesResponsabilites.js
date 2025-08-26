import ActeursHomologation from './acteursHomologation.js';
import InformationsService from './informationsService.js';
import PartiesPrenantes from './partiesPrenantes/partiesPrenantes.js';

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

class RolesResponsabilites extends InformationsService {
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

export default RolesResponsabilites;
