const ActeursHomologation = require('./acteursHomologation');
const InformationsHomologation = require('./informationsHomologation');
const PartiesPrenantesHomologation = require('./partiesPrenantes/partiesPrenantes');

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
        partiesPrenantes: PartiesPrenantesHomologation,
      },
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

  descriptionDelegueProtectionDonnees() {
    return descriptionPartiePrenante(
      this.delegueProtectionDonnees, this.fonctionDelegueProtectionDonnees
    );
  }

  descriptionHebergeur() {
    return this.partiesPrenantes.hebergement()?.nom || 'Hébergeur non renseigné';
  }

  descriptionStructureDeveloppement() {
    return this.partiesPrenantes.developpementFourniture()?.nom || '';
  }

  entitesExternes() {
    return this.partiesPrenantes.specifiques().map((specifique) => ({
      nom: specifique.nom,
      acces: specifique.natureAcces,
      contact: specifique.pointContact,
    }));
  }
}

module.exports = PartiesPrenantes;
