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

class CartographieActeurs extends InformationsHomologation {
  constructor(donnees = {}) {
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

    this.renseigneProprietes(donnees);
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

  descriptionActeursHomologation() {
    const acteurHomologationDecrit = (role, description) => ({ role, description });
    const description = (acteur) => acteur.nom + (acteur.fonction ? ` (${acteur.fonction})` : '');
    const acteursSpecifiques = () => this.acteursHomologation.tous()
      .map((acteur) => acteurHomologationDecrit(acteur.role, description(acteur)));

    const acteurs = [
      acteurHomologationDecrit("Autorité d'homologation", this.descriptionAutoriteHomologation()),
      acteurHomologationDecrit('Spécialiste cybersécurité', this.descriptionExpertCybersecurite()),
      acteurHomologationDecrit('Délégué(e) à la protection des données à caractère personnel', this.descriptionDelegueProtectionDonnees()),
      acteurHomologationDecrit('Responsable métier du projet', this.descriptionPiloteProjet()),
      ...acteursSpecifiques(),
    ];

    return acteurs.filter((acteur) => acteur.description !== 'Information non renseignée');
  }
}

module.exports = CartographieActeurs;
