const ActeursHomologation = require('./acteursHomologation');
const InformationsHomologation = require('./informationsHomologation');
const PartiesPrenantes = require('./partiesPrenantes/partiesPrenantes');

const descriptionRole = (nomPrenom, fonction) => {
  const description = [];
  if (nomPrenom) {
    description.push(nomPrenom);
    description.push(fonction ? `(${fonction})` : '(fonction non renseignée)');
  }

  return description.length === 0 ? 'Information non renseignée' : description.join(' ');
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

  descriptionEquipePreparation() {
    const membresEquipe = [];
    if (this.piloteProjet) membresEquipe.push(this.descriptionPiloteProjet());
    if (this.expertCybersecurite) membresEquipe.push(this.descriptionExpertCybersecurite());

    return membresEquipe.length === 0 ? 'Information non renseignée' : membresEquipe.join(', ');
  }

  descriptionAutoriteHomologation() {
    return descriptionRole(this.autoriteHomologation, this.fonctionAutoriteHomologation);
  }

  descriptionPiloteProjet() {
    return descriptionRole(this.piloteProjet, this.fonctionPiloteProjet);
  }

  descriptionExpertCybersecurite() {
    return descriptionRole(this.expertCybersecurite, this.fonctionExpertCybersecurite);
  }

  descriptionDelegueProtectionDonnees() {
    return descriptionRole(
      this.delegueProtectionDonnees, this.fonctionDelegueProtectionDonnees
    );
  }

  descriptionHebergeur() {
    return this.partiesPrenantes.hebergement()?.nom || 'Hébergeur non renseigné';
  }

  descriptionStructureDeveloppement() {
    return this.partiesPrenantes.developpementFourniture()?.nom || '';
  }

  descriptionGouvernance() {
    const acteurDecrit = (role, description) => ({ role, description });
    const description = (acteur) => acteur.nom + (acteur.fonction ? ` (${acteur.fonction})` : '');
    const acteursSpecifiques = () => this.acteursHomologation.tous()
      .map((acteur) => acteurDecrit(acteur.role, description(acteur)));

    const acteurs = [
      acteurDecrit("Autorité d'homologation", this.descriptionAutoriteHomologation()),
      acteurDecrit('Spécialiste cybersécurité', this.descriptionExpertCybersecurite()),
      acteurDecrit('Délégué(e) à la protection des données à caractère personnel', this.descriptionDelegueProtectionDonnees()),
      acteurDecrit('Responsable métier du projet', this.descriptionPiloteProjet()),
      ...acteursSpecifiques(),
    ];

    return acteurs.filter((acteur) => acteur.description !== 'Information non renseignée');
  }
}

module.exports = RolesResponsabilites;
