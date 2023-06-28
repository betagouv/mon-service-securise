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
        const etapeCourante =
          this.service.dossiers.dossierCourant()?.etapeCourante() ??
          this.referentiel.premiereEtapeParcours().id;
        liens.push({
          libelle: "Commencer l'homologation",
          url: `/service/${this.service.id}/homologation/edition/etape/${etapeCourante}`,
        });
        break;
      }
      case Dossiers.BIENTOT_ACTIVEE: {
        const dossierBientotActif = this.service.dossiers.items.find(
          (d) => d.finalise && !d.archive && !d.estActif()
        );

        validite = {
          debut: dossierBientotActif.descriptionDateHomologation(),
          duree: dossierBientotActif.descriptionDureeValidite(),
        };
        break;
      }

      case Dossiers.ACTIVEE: {
        const dossierActif = this.service.dossiers.dossierActif();
        validite = {
          duree: dossierActif.descriptionDureeValidite(),
          fin: dossierActif.descriptionProchaineDateHomologation(),
        };
        break;
      }

      case Dossiers.BIENTOT_EXPIREE: {
        const etapeCourante =
          this.service.dossiers.dossierCourant()?.etapeCourante() ??
          this.referentiel.premiereEtapeParcours().id;
        const dossierActif = this.service.dossiers.dossierActif();
        validite = {
          fin: dossierActif.descriptionProchaineDateHomologation(),
        };
        liens.push({
          libelle: "Renouveler l'homologation",
          url: `/service/${this.service.id}/homologation/edition/etape/${etapeCourante}`,
        });
        break;
      }

      case Dossiers.EXPIREE: {
        const etapeCourante =
          this.service.dossiers.dossierCourant()?.etapeCourante() ??
          this.referentiel.premiereEtapeParcours().id;
        const dossierExpire = this.service.dossiers
          .finalises()
          .find((dossier) => dossier.estExpire());
        validite = {
          fin: dossierExpire.descriptionProchaineDateHomologation(),
        };
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
}

module.exports = VueStatutHomologation;
