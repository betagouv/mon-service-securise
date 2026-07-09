import ActeursHomologation from './acteursHomologation.js';
import { DonneesActeurHomologation } from './acteurHomologation.js';
import InformationsService from './informationsService.js';
import PartiesPrenantes from './partiesPrenantes/partiesPrenantes.js';
import { DonneesPartiePrenante } from './partiesPrenantes/partiePrenante.js';

export type DonneesRolesResponsabilites = {
  autoriteHomologation: string;
  fonctionAutoriteHomologation: string;
  delegueProtectionDonnees: string;
  fonctionDelegueProtectionDonnees: string;
  piloteProjet: string;
  fonctionPiloteProjet: string;
  expertCybersecurite: string;
  fonctionExpertCybersecurite: string;
  acteursHomologation: DonneesActeurHomologation[];
  partiesPrenantes: Array<Partial<DonneesPartiePrenante> & { type: string }>;
};

const descriptionRole = (nomPrenom?: string, fonction?: string): string => {
  const description: string[] = [];
  if (nomPrenom) {
    description.push(nomPrenom);
    description.push(fonction ? `(${fonction})` : '(fonction non renseignée)');
  }

  return description.length === 0
    ? 'Information non renseignée'
    : description.join(' ');
};

class RolesResponsabilites extends InformationsService {
  readonly autoriteHomologation!: string;
  readonly fonctionAutoriteHomologation!: string;
  readonly delegueProtectionDonnees!: string;
  readonly fonctionDelegueProtectionDonnees!: string;
  readonly piloteProjet!: string;
  readonly fonctionPiloteProjet!: string;
  readonly expertCybersecurite!: string;
  readonly fonctionExpertCybersecurite!: string;
  readonly acteursHomologation!: ActeursHomologation;
  readonly partiesPrenantes!: PartiesPrenantes;

  constructor(
    donneesRolesResponsabilites: Partial<DonneesRolesResponsabilites> = {}
  ) {
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
