const Dossiers = require('../dossiers');

class VueStatutHomologation {
  constructor(service, referentiel) {
    this.service = service;
    this.referentiel = referentiel;
  }

  donnees() {
    const statut = this.service.dossiers.statutHomologation();

    const liens = [];
    let validite = {};
    switch (statut) {
      case Dossiers.NON_REALISEE: {
        const etapeCourante = this.etapeCourante();
        liens.push({
          libelle: "Commencer l'homologation",
          url: `/service/${this.service.id}/homologation/edition/etape/${etapeCourante}`,
        });
        break;
      }
      case Dossiers.BIENTOT_ACTIVEE: {
        validite = {
          debut: this.dossierActif().descriptionDateHomologation(),
          duree: this.dossierActif().descriptionDureeValidite(),
        };
        break;
      }

      case Dossiers.ACTIVEE: {
        validite = {
          duree: this.dossierActif().descriptionDureeValidite(),
          fin: this.dossierActif().descriptionProchaineDateHomologation(),
        };
        break;
      }

      case Dossiers.BIENTOT_EXPIREE: {
        validite = {
          fin: this.dossierActif().descriptionProchaineDateHomologation(),
        };
        const etapeCourante = this.etapeCourante();
        liens.push({
          libelle: "Renouveler l'homologation",
          url: `/service/${this.service.id}/homologation/edition/etape/${etapeCourante}`,
        });
        break;
      }

      case Dossiers.EXPIREE: {
        validite = {
          fin: this.dossierActif().descriptionProchaineDateHomologation(),
        };
        const etapeCourante = this.etapeCourante();
        liens.push({
          libelle: "Renouveler l'homologation",
          url: `/service/${this.service.id}/homologation/edition/etape/${etapeCourante}`,
        });
        break;
      }

      default: {
        break;
      }
    }

    return {
      statut,
      ...this.referentiel.statutHomologation(statut),
      metadonnees: {
        ...(liens.length !== 0 && { liens }),
        ...(Object.keys(validite).length !== 0 && { validite }),
      },
    };
  }

  dossierActif() {
    return this.service.dossiers.dossierActif();
  }

  etapeCourante() {
    return (
      this.service.dossiers.dossierCourant()?.etapeCourante() ??
      this.referentiel.premiereEtapeParcours().id
    );
  }
}

module.exports = VueStatutHomologation;
